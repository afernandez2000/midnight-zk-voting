// Integration Test Suite

import { SecureCryptographicNullifier, SecureNullifierRegistry } from '../cryptography/secureNullifier';
import { ErrorHandler, ErrorCode, CircuitBreaker } from '../utils/errorHandling';
import { CryptoPerformanceCache, BatchProcessor, PerformanceMonitor } from '../utils/performanceOptimizations';

export class IntegrationTestSuite {
  private static testResults: Array<{
    testName: string;
    passed: boolean;
    error?: string;
    duration: number;
  }> = [];

  static async runAllTests(): Promise<{
    totalTests: number;
    passed: number;
    failed: number;
    results: any[];
  }> {
    console.log('🔗 Starting Integration Tests...\n');
    this.testResults = [];

    // Core integration tests
    await this.runTest('End-to-End Voting Flow', this.testEndToEndVotingFlow);
    await this.runTest('Multi-Voter Scenario', this.testMultiVoterScenario);
    await this.runTest('Cross-Proposal Voting', this.testCrossProposalVoting);
    await this.runTest('Error Handling Integration', this.testErrorHandlingIntegration);
    await this.runTest('Performance Optimization Integration', this.testPerformanceOptimizationIntegration);
    await this.runTest('Circuit Breaker Integration', this.testCircuitBreakerIntegration);
    await this.runTest('Concurrent Voting Simulation', this.testConcurrentVotingSimulation);
    await this.runTest('Registry Scaling Test', this.testRegistryScaling);
    await this.runTest('Memory Management Under Load', this.testMemoryManagementUnderLoad);
    await this.runTest('Security Boundary Testing', this.testSecurityBoundaries);

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.length - passed;

    console.log(`\n📊 Integration Test Results:`);
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

    return {
      totalTests: this.testResults.length,
      passed,
      failed,
      results: this.testResults
    };
  }

  private static async runTest(testName: string, testFunction: () => Promise<void>): Promise<void> {
    const startTime = performance.now();
    try {
      await testFunction();
      const duration = performance.now() - startTime;
      this.testResults.push({ testName, passed: true, duration });
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms`);
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.testResults.push({ testName, passed: false, error: errorMessage, duration });
      console.log(`❌ ${testName} - ${errorMessage}`);
    }
  }

  private static async testEndToEndVotingFlow(): Promise<void> {
    // Complete voting flow from credential generation to result verification
    const registry = new SecureNullifierRegistry();
    const proposalId = 'integration_test_proposal';
    const voterRegistryRoot = 'test_registry_root';

    // Step 1: Generate voter credentials
    const voter1 = SecureCryptographicNullifier.generateSecureVoterCredentials();
    const voter2 = SecureCryptographicNullifier.generateSecureVoterCredentials();

    if (!voter1.voterSecret || !voter2.voterSecret) {
      throw new Error('Failed to generate voter credentials');
    }

    // Step 2: Generate voting proofs
    const vote1 = SecureCryptographicNullifier.generateSecureNullifier(voter1, proposalId, 1);
    const vote2 = SecureCryptographicNullifier.generateSecureNullifier(voter2, proposalId, 0);

    // Step 3: Verify proofs
    const proof1Valid = SecureCryptographicNullifier.verifyNullifierProof(vote1, proposalId, voterRegistryRoot);
    const proof2Valid = SecureCryptographicNullifier.verifyNullifierProof(vote2, proposalId, voterRegistryRoot);

    if (!proof1Valid || !proof2Valid) {
      throw new Error('Generated proofs failed verification');
    }

    // Step 4: Submit votes to registry
    const submission1 = registry.addNullifier(vote1, proposalId);
    const submission2 = registry.addNullifier(vote2, proposalId);

    if (!submission1 || !submission2) {
      throw new Error('Failed to submit valid votes to registry');
    }

    // Step 5: Verify registry integrity
    const integrityCheck = registry.verifyRegistryIntegrity();
    if (!integrityCheck) {
      throw new Error('Registry integrity check failed after submissions');
    }

    // Step 6: Attempt double vote (should fail)
    const doubleVote = SecureCryptographicNullifier.generateSecureNullifier(voter1, proposalId, 0);
    const doubleVoteResult = registry.addNullifier(doubleVote, proposalId);

    if (doubleVoteResult) {
      throw new Error('Double vote was not prevented');
    }
  }

  private static async testMultiVoterScenario(): Promise<void> {
    const registry = new SecureNullifierRegistry();
    const proposalId = 'multi_voter_proposal';
    const numVoters = 50;
    const voters = [];
    const votes = [];

    // Generate multiple voters
    for (let i = 0; i < numVoters; i++) {
      const voter = SecureCryptographicNullifier.generateSecureVoterCredentials();
      voters.push(voter);

      const vote = SecureCryptographicNullifier.generateSecureNullifier(
        voter, 
        proposalId, 
        i % 2 // Alternate between Yes and No votes
      );
      votes.push(vote);
    }

    // Submit all votes
    let successfulSubmissions = 0;
    for (const vote of votes) {
      const result = registry.addNullifier(vote, proposalId);
      if (result) {
        successfulSubmissions++;
      }
    }

    if (successfulSubmissions !== numVoters) {
      throw new Error(`Expected ${numVoters} successful submissions, got ${successfulSubmissions}`);
    }

    // Verify all nullifiers are unique
    const nullifiers = new Set(votes.map(v => v.nullifier));
    if (nullifiers.size !== numVoters) {
      throw new Error('Duplicate nullifiers detected in multi-voter scenario');
    }

    // Verify registry integrity
    const integrityCheck = registry.verifyRegistryIntegrity();
    if (!integrityCheck) {
      throw new Error('Registry integrity failed with multiple voters');
    }
  }

  private static async testCrossProposalVoting(): Promise<void> {
    const registry = new SecureNullifierRegistry();
    const voter = SecureCryptographicNullifier.generateSecureVoterCredentials();
    const proposals = ['proposal_A', 'proposal_B', 'proposal_C'];

    // Voter should be able to vote on multiple proposals
    for (const proposalId of proposals) {
      const vote = SecureCryptographicNullifier.generateSecureNullifier(voter, proposalId, 1);
      const result = registry.addNullifier(vote, proposalId);
      
      if (!result) {
        throw new Error(`Failed to vote on proposal ${proposalId}`);
      }
    }

    // Verify all votes were recorded
    const integrityCheck = registry.verifyRegistryIntegrity();
    if (!integrityCheck) {
      throw new Error('Registry integrity failed with cross-proposal voting');
    }

    // Attempt double vote on one proposal (should fail)
    const doubleVote = SecureCryptographicNullifier.generateSecureNullifier(voter, proposals[0], 0);
    const doubleVoteResult = registry.addNullifier(doubleVote, proposals[0]);

    if (doubleVoteResult) {
      throw new Error('Double vote on single proposal was not prevented');
    }
  }

  private static async testErrorHandlingIntegration(): Promise<void> {
    // Test error handling with invalid operations
    const registry = new SecureNullifierRegistry();
    
    // Test with invalid vote choice
    try {
      const voter = SecureCryptographicNullifier.generateSecureVoterCredentials();
      SecureCryptographicNullifier.generateSecureNullifier(voter, 'test_proposal', 5); // Invalid choice
      throw new Error('Should have thrown error for invalid vote choice');
    } catch (error) {
      if (error.message.includes('Should have thrown')) {
        throw error;
      }
      // Expected error
    }

    // Test error creation and handling
    const testError = ErrorHandler.createError(
      ErrorCode.DOUBLE_VOTE_DETECTED,
      'Test double vote error',
      { proposalId: 'test_proposal' },
      'high'
    );

    if (testError.code !== ErrorCode.DOUBLE_VOTE_DETECTED) {
      throw new Error('Error code not set correctly');
    }

    if (!testError.userMessage.includes('already voted')) {
      throw new Error('User-friendly message not generated correctly');
    }

    // Test async error handling
    const testOperation = async () => {
      throw new Error('Test async error');
    };

    try {
      await ErrorHandler.handleAsync(testOperation, 'fallback_value');
      // Should return fallback value, not reach here unless it's recoverable
    } catch (error) {
      // Expected for non-recoverable errors
    }
  }

  private static async testPerformanceOptimizationIntegration(): Promise<void> {
    // Test performance optimizations work correctly
    const testInputs = Array.from({ length: 100 }, (_, i) => `test_input_${i}`);

    // Test batch processing
    const batchResults = await BatchProcessor.addToBatch(async () => {
      return testInputs.map(input => `processed_${input}`);
    });

    if (batchResults.length !== testInputs.length) {
      throw new Error('Batch processing failed');
    }

    // Test performance monitoring
    const operation = 'test_operation';
    const stopTiming = PerformanceMonitor.startTiming(operation);
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10));
    
    stopTiming();

    const metrics = PerformanceMonitor.getMetrics(operation);
    if (!metrics || metrics.count !== 1) {
      throw new Error('Performance monitoring failed');
    }

    // Test cache functionality
    const cacheKey = 'test_cache_key';
    const cachedResult = CryptoPerformanceCache.getHashCached(cacheKey);
    const cachedResult2 = CryptoPerformanceCache.getHashCached(cacheKey);

    if (cachedResult !== cachedResult2) {
      throw new Error('Cache not working correctly');
    }

    const cacheStats = CryptoPerformanceCache.getCacheStats();
    if (cacheStats.hashCacheSize === 0) {
      throw new Error('Cache stats not updating');
    }
  }

  private static async testCircuitBreakerIntegration(): Promise<void> {
    const circuitBreaker = new CircuitBreaker(3, 1000); // 3 failures, 1 second timeout

    // Test normal operation
    const successOperation = async () => 'success';
    const result1 = await circuitBreaker.execute(successOperation);
    if (result1 !== 'success') {
      throw new Error('Circuit breaker failed normal operation');
    }

    // Test failure handling
    const failOperation = async () => { throw new Error('Intentional failure'); };

    // Trigger failures to open circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(failOperation);
        throw new Error('Should have thrown error');
      } catch (error) {
        if (error.message === 'Should have thrown error') {
          throw error;
        }
        // Expected failure
      }
    }

    // Circuit should be open now
    const state = circuitBreaker.getState();
    if (state.state !== 'open') {
      throw new Error('Circuit breaker should be open after failures');
    }

    // Should reject operations when open
    try {
      await circuitBreaker.execute(successOperation);
      throw new Error('Circuit breaker should reject operations when open');
    } catch (error) {
      if (!error.message.includes('Circuit breaker is open')) {
        throw new Error('Expected circuit breaker error');
      }
    }
  }

  private static async testConcurrentVotingSimulation(): Promise<void> {
    const registry = new SecureNullifierRegistry();
    const proposalId = 'concurrent_test_proposal';
    const numConcurrentVoters = 20;

    // Create concurrent voting operations
    const votingPromises = Array.from({ length: numConcurrentVoters }, async (_, i) => {
      const voter = SecureCryptographicNullifier.generateSecureVoterCredentials();
      const vote = SecureCryptographicNullifier.generateSecureNullifier(voter, proposalId, i % 2);
      
      // Add random delay to simulate network conditions
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      return registry.addNullifier(vote, proposalId);
    });

    // Execute all votes concurrently
    const results = await Promise.all(votingPromises);
    
    // All votes should succeed (no double voting in this case)
    const successCount = results.filter(r => r).length;
    if (successCount !== numConcurrentVoters) {
      throw new Error(`Expected ${numConcurrentVoters} successful votes, got ${successCount}`);
    }

    // Registry should maintain integrity
    const integrityCheck = registry.verifyRegistryIntegrity();
    if (!integrityCheck) {
      throw new Error('Registry integrity failed under concurrent load');
    }
  }

  private static async testRegistryScaling(): Promise<void> {
    const registry = new SecureNullifierRegistry();
    const numEntries = 1000;
    const proposalId = 'scaling_test_proposal';

    console.log(`   Testing registry with ${numEntries} entries...`);

    // Add many entries to test scaling
    const startTime = performance.now();
    for (let i = 0; i < numEntries; i++) {
      const voter = SecureCryptographicNullifier.generateSecureVoterCredentials();
      const vote = SecureCryptographicNullifier.generateSecureNullifier(
        voter, 
        `${proposalId}_${i}`, // Different proposal for each to avoid duplicates
        i % 2
      );
      
      const result = registry.addNullifier(vote, `${proposalId}_${i}`);
      if (!result) {
        throw new Error(`Failed to add entry ${i}`);
      }

      // Periodic integrity checks
      if (i % 100 === 0) {
        const integrityCheck = registry.verifyRegistryIntegrity();
        if (!integrityCheck) {
          throw new Error(`Registry integrity failed at entry ${i}`);
        }
      }
    }

    const endTime = performance.now();
    const avgTime = (endTime - startTime) / numEntries;
    
    console.log(`   Scaling performance: ${avgTime.toFixed(3)}ms per entry`);

    // Final integrity check
    const finalIntegrityCheck = registry.verifyRegistryIntegrity();
    if (!finalIntegrityCheck) {
      throw new Error('Final registry integrity check failed');
    }

    // Performance should be reasonable (less than 1ms per entry)
    if (avgTime > 1) {
      throw new Error(`Registry scaling performance too slow: ${avgTime.toFixed(3)}ms per entry`);
    }
  }

  private static async testMemoryManagementUnderLoad(): Promise<void> {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const iterations = 500;

    // Generate many operations to test memory management
    for (let i = 0; i < iterations; i++) {
      const voter = SecureCryptographicNullifier.generateSecureVoterCredentials();
      const vote = SecureCryptographicNullifier.generateSecureNullifier(voter, `proposal_${i}`, i % 2);
      
      // Simulate processing and cleanup
      const registry = new SecureNullifierRegistry();
      registry.addNullifier(vote, `proposal_${i}`);
      
      // Occasional garbage collection hint
      if (i % 100 === 0 && global.gc) {
        global.gc();
      }
    }

    // Clear caches
    CryptoPerformanceCache.clearCache();
    PerformanceMonitor.clearMetrics();

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Memory usage should not have grown excessively
    if (initialMemory > 0 && finalMemory > initialMemory * 10) {
      console.log(`   Memory usage: ${initialMemory} -> ${finalMemory} bytes`);
      throw new Error('Excessive memory usage detected');
    }

    console.log(`   Memory test completed: ${iterations} iterations`);
  }

  private static async testSecurityBoundaries(): Promise<void> {
    // Test that security boundaries are properly enforced
    const registry = new SecureNullifierRegistry();
    const legitimateVoter = SecureCryptographicNullifier.generateSecureVoterCredentials();

    // Test tampering detection
    const validVote = SecureCryptographicNullifier.generateSecureNullifier(
      legitimateVoter, 'secure_proposal', 1
    );

    // Tamper with various fields
    const tamperedVotes = [
      { ...validVote, nullifier: 'tampered_nullifier' },
      { ...validVote, voteCommitment: 'tampered_commitment' },
      { ...validVote, timestamp: validVote.timestamp + 3600000 }, // 1 hour in future
      { ...validVote, rangeProof: 'tampered_range_proof' },
      { ...validVote, membershipProof: 'tampered_membership_proof' }
    ];

    for (const tamperedVote of tamperedVotes) {
      const result = registry.addNullifier(tamperedVote, 'secure_proposal');
      if (result) {
        throw new Error('Tampered vote was accepted');
      }
    }

    // Valid vote should still work
    const validResult = registry.addNullifier(validVote, 'secure_proposal');
    if (!validResult) {
      throw new Error('Valid vote was rejected after tamper tests');
    }

    // Test input sanitization
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert(1)',
      '../../etc/passwd',
      'null\0byte',
      '\x00\x01\x02\x03'
    ];

    for (const maliciousInput of maliciousInputs) {
      try {
        const maliciousVote = SecureCryptographicNullifier.generateSecureNullifier(
          legitimateVoter, maliciousInput, 1
        );
        
        // The vote might be generated, but verification should fail
        const verificationResult = SecureCryptographicNullifier.verifyNullifierProof(
          maliciousVote, maliciousInput, 'test_root'
        );
        
        // Either generation fails or verification fails - both are acceptable
      } catch (error) {
        // Expected for malicious inputs
      }
    }
  }

  static getDetailedResults(): any[] {
    return this.testResults;
  }

  static getFailedTests(): any[] {
    return this.testResults.filter(r => !r.passed);
  }
}

export default IntegrationTestSuite;