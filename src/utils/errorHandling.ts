// Competition-Grade Error Handling and Validation System

export enum ErrorCode {
  // Cryptographic Errors
  INVALID_NULLIFIER = 'CRYPTO_001',
  PROOF_VERIFICATION_FAILED = 'CRYPTO_002',
  INVALID_COMMITMENT = 'CRYPTO_003',
  MERKLE_PROOF_INVALID = 'CRYPTO_004',
  
  // Voting Errors
  DOUBLE_VOTE_DETECTED = 'VOTE_001',
  INVALID_PROPOSAL = 'VOTE_002',
  VOTING_ENDED = 'VOTE_003',
  VOTER_NOT_ELIGIBLE = 'VOTE_004',
  INVALID_VOTE_CHOICE = 'VOTE_005',
  
  // Network Errors
  WALLET_NOT_CONNECTED = 'NET_001',
  TRANSACTION_FAILED = 'NET_002',
  NETWORK_TIMEOUT = 'NET_003',
  
  // Validation Errors
  INVALID_INPUT = 'VAL_001',
  MISSING_PARAMETER = 'VAL_002',
  TYPE_MISMATCH = 'VAL_003',
  
  // System Errors
  INTERNAL_ERROR = 'SYS_001',
  INITIALIZATION_FAILED = 'SYS_002',
  RESOURCE_EXHAUSTED = 'SYS_003'
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  userMessage: string;
}

export class ZKVotingError extends Error {
  public readonly code: ErrorCode;
  public readonly context: Record<string, any>;
  public readonly timestamp: number;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly recoverable: boolean;
  public readonly userMessage: string;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'ZKVotingError';
    this.code = details.code;
    this.context = details.context || {};
    this.timestamp = details.timestamp;
    this.severity = details.severity;
    this.recoverable = details.recoverable;
    this.userMessage = details.userMessage;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      severity: this.severity,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  private static errorLog: ZKVotingError[] = [];
  private static maxLogSize = 1000;

  static createError(
    code: ErrorCode,
    message: string,
    context?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): ZKVotingError {
    const error = new ZKVotingError({
      code,
      message,
      context,
      timestamp: Date.now(),
      severity,
      recoverable: severity !== 'critical',
      userMessage: this.getUserFriendlyMessage(code, context)
    });

    this.logError(error);
    return error;
  }

  static handleAsync<T>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    return operation().catch((error) => {
      const zkError = error instanceof ZKVotingError 
        ? error 
        : this.createError(
            ErrorCode.INTERNAL_ERROR,
            error.message || 'Unknown error occurred',
            { originalError: error },
            'high'
          );

      this.logError(zkError);

      if (zkError.recoverable && fallback !== undefined) {
        return fallback;
      }

      throw zkError;
    });
  }

  static validateInput(input: any, validators: ValidationRule[]): void {
    for (const validator of validators) {
      try {
        validator.validate(input);
      } catch (error) {
        throw this.createError(
          ErrorCode.INVALID_INPUT,
          `Validation failed: ${error.message}`,
          { input, validator: validator.name },
          'medium'
        );
      }
    }
  }

  private static getUserFriendlyMessage(
    code: ErrorCode,
    context?: Record<string, any>
  ): string {
    switch (code) {
      case ErrorCode.DOUBLE_VOTE_DETECTED:
        return 'You have already voted on this proposal. Each voter can only vote once.';
      case ErrorCode.INVALID_PROPOSAL:
        return 'This proposal is not valid or has been removed.';
      case ErrorCode.VOTING_ENDED:
        return 'Voting for this proposal has ended. You can view the results instead.';
      case ErrorCode.VOTER_NOT_ELIGIBLE:
        return 'You are not eligible to vote on this proposal.';
      case ErrorCode.WALLET_NOT_CONNECTED:
        return 'Please connect your wallet to continue voting.';
      case ErrorCode.PROOF_VERIFICATION_FAILED:
        return 'Your vote could not be verified. Please try again.';
      case ErrorCode.NETWORK_TIMEOUT:
        return 'Network connection timed out. Please check your internet and try again.';
      case ErrorCode.INVALID_VOTE_CHOICE:
        return 'Please select a valid vote option (Yes or No).';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  private static logError(error: ZKVotingError): void {
    // Add to error log
    this.errorLog.push(error);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('ZK Voting Error:', error.toJSON());
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production' && error.severity === 'critical') {
      this.sendToMonitoring(error);
    }
  }

  private static sendToMonitoring(error: ZKVotingError): void {
    // Send to external monitoring service (Sentry, DataDog, etc.)
    // Implementation would depend on chosen service
    console.error('Critical error detected:', error.toJSON());
  }

  static getErrorHistory(): ZKVotingError[] {
    return [...this.errorLog];
  }

  static clearErrorHistory(): void {
    this.errorLog = [];
  }
}

export interface ValidationRule {
  name: string;
  validate: (input: any) => void;
}

export class Validators {
  static required(fieldName: string): ValidationRule {
    return {
      name: `required_${fieldName}`,
      validate: (input: any) => {
        if (input === null || input === undefined || input === '') {
          throw new Error(`${fieldName} is required`);
        }
      }
    };
  }

  static string(fieldName: string, minLength = 0, maxLength = Infinity): ValidationRule {
    return {
      name: `string_${fieldName}`,
      validate: (input: any) => {
        if (typeof input !== 'string') {
          throw new Error(`${fieldName} must be a string`);
        }
        if (input.length < minLength) {
          throw new Error(`${fieldName} must be at least ${minLength} characters`);
        }
        if (input.length > maxLength) {
          throw new Error(`${fieldName} must be no more than ${maxLength} characters`);
        }
      }
    };
  }

  static number(fieldName: string, min = -Infinity, max = Infinity): ValidationRule {
    return {
      name: `number_${fieldName}`,
      validate: (input: any) => {
        if (typeof input !== 'number' || isNaN(input)) {
          throw new Error(`${fieldName} must be a valid number`);
        }
        if (input < min) {
          throw new Error(`${fieldName} must be at least ${min}`);
        }
        if (input > max) {
          throw new Error(`${fieldName} must be no more than ${max}`);
        }
      }
    };
  }

  static voteChoice(): ValidationRule {
    return {
      name: 'vote_choice',
      validate: (input: any) => {
        if (input !== 0 && input !== 1) {
          throw new Error('Vote choice must be 0 (No) or 1 (Yes)');
        }
      }
    };
  }

  static proposalId(): ValidationRule {
    return {
      name: 'proposal_id',
      validate: (input: any) => {
        if (typeof input !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(input)) {
          throw new Error('Proposal ID must be alphanumeric with underscores and hyphens only');
        }
      }
    };
  }

  static nullifier(): ValidationRule {
    return {
      name: 'nullifier',
      validate: (input: any) => {
        if (typeof input !== 'string' || !/^[a-fA-F0-9]{64}$/.test(input)) {
          throw new Error('Nullifier must be a 64-character hexadecimal string');
        }
      }
    };
  }

  static timestamp(): ValidationRule {
    return {
      name: 'timestamp',
      validate: (input: any) => {
        if (typeof input !== 'number' || input <= 0) {
          throw new Error('Timestamp must be a positive number');
        }
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        if (Math.abs(now - input) > oneHour) {
          throw new Error('Timestamp must be within the last hour');
        }
      }
    };
  }
}

// Circuit breaker for preventing cascade failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw ErrorHandler.createError(
          ErrorCode.RESOURCE_EXHAUSTED,
          'Circuit breaker is open - operation temporarily unavailable',
          { state: this.state, failures: this.failures },
          'high'
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

export default ErrorHandler;