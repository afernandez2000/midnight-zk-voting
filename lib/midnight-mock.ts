// Mock implementation of Midnight SDK for development and demonstration

export class Field {
  private value: string;

  constructor(value: string | number) {
    this.value = value.toString();
  }

  static fromString(value: string): Field {
    return new Field(value);
  }

  static fromNumber(value: number): Field {
    return new Field(value);
  }

  toString(): string {
    return this.value;
  }

  add(other: Field): Field {
    return new Field(parseInt(this.value) + parseInt(other.value));
  }

  equals(other: Field): boolean {
    return this.value === other.value;
  }
}

export class Poseidon {
  static hash(inputs: Field[]): Field {
    // Mock hash function - in real implementation this would be cryptographically secure
    const combined = inputs.map(f => f.toString()).join('');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return new Field(Math.abs(hash).toString());
  }
}

export class MidnightWallet {
  private connected = false;

  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAddress(): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    return '0x' + Math.random().toString(16).substr(2, 40);
  }
}

export class Contract {
  private compiled = false;

  async compile(): Promise<void> {
    // Simulate compilation
    await new Promise(resolve => setTimeout(resolve, 500));
    this.compiled = true;
  }

  isCompiled(): boolean {
    return this.compiled;
  }
}

export class State<T> {
  private value: T | undefined;

  get(): T {
    if (this.value === undefined) {
      throw new Error('State not initialized');
    }
    return this.value;
  }

  set(value: T): void {
    this.value = value;
  }
}

// Export types
export interface PublicKey {
  toString(): string;
}

export interface Signature {
  verify(message: string, publicKey: PublicKey): boolean;
}

export interface MerkleTree {
  root: Field;
  addLeaf(leaf: Field): void;
  getPath(index: number): Field[];
}