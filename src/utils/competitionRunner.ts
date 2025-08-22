// Test Runner and Validation Suite

import CryptographyTestSuite from '../tests/cryptographyTests';
import IntegrationTestSuite from '../tests/integrationTests';
import SecurityAuditor from '../security/securityAudit';
import PenetrationTester from '../security/penetrationTesting';
import CompetitionReadinessAssessment from '../documentation/competitionGuide';
import { PerformanceMonitor } from './performanceOptimizations';

export interface CompetitionValidationResult {
  timestamp: number;
  overallScore: number;
  competitionReady: boolean;
  testResults: {
    cryptography: any;
    integration: any;
    security: any;
    penetration: any;
  };
  performance: {
    metrics: any;
    benchmarks: any;
  };
  readiness: any;
  recommendations: string[];
  criticalIssues: string[];
}

export class CompetitionRunner {
  static async runFullValidation(): Promise<CompetitionValidationResult> {
    console.log('🏆 Starting Validation Suite');
    console.log('=' .repeat(60));
    console.log('This comprehensive test will validate all aspects of the system\n');

    const startTime = Date.now();

    try {
      // 1. Run Cryptography Tests
      console.log('Phase 1: Cryptographic Security Validation');
      console.log('-' .repeat(40));
      const cryptographyResults = await PerformanceMonitor.measureAsync(
        'cryptography_tests',
        () => CryptographyTestSuite.runAllTests()
      );

      // 2. Run Integration Tests  
      console.log('\nPhase 2: System Integration Validation');
      console.log('-' .repeat(40));
      const integrationResults = await PerformanceMonitor.measureAsync(
        'integration_tests',
        () => IntegrationTestSuite.runAllTests()
      );

      // 3. Run Security Audit
      console.log('\nPhase 3: Security Audit');
      console.log('-' .repeat(40));
      const securityResults = await PerformanceMonitor.measureAsync(
        'security_audit',
        () => SecurityAuditor.runFullSecurityAudit()
      );

      // 4. Run Penetration Testing
      console.log('\nPhase 4: Penetration Testing');
      console.log('-' .repeat(40));
      const penetrationResults = await PerformanceMonitor.measureAsync(
        'penetration_testing',
        () => PenetrationTester.runFullPenetrationTest()
      );

      // 5. Performance Benchmarks
      console.log('\nPhase 5: Performance Benchmarking');
      console.log('-' .repeat(40));
      const performanceBenchmarks = await this.runPerformanceBenchmarks();

      // 6. Competition Readiness Assessment
      console.log('\nPhase 6: Competition Readiness Assessment');
      console.log('-' .repeat(40));
      const readinessAssessment = CompetitionReadinessAssessment.generateCompetitionReport();
      CompetitionReadinessAssessment.printCompetitionAssessment();

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Compile Results
      const result = this.compileValidationResults({
        cryptographyResults,
        integrationResults,
        securityResults,
        penetrationResults,
        performanceBenchmarks,
        readinessAssessment,
        totalTime
      });

      // Print Final Summary
      this.printFinalSummary(result);

      return result;

    } catch (error) {
      console.error('\n❌ Validation suite encountered an error:', error);
      throw error;
    }
  }

  private static async runPerformanceBenchmarks(): Promise<any> {
    console.log('🚀 Running Performance Benchmarks...\n');

    const benchmarks = {
      nullifierGeneration: await this.benchmarkNullifierGeneration(),
      proofVerification: await this.benchmarkProofVerification(),
      concurrentOperations: await this.benchmarkConcurrentOperations(),
      memoryUsage: await this.benchmarkMemoryUsage(),
      scalability: await this.benchmarkScalability()
    };

    console.log('✅ Performance benchmarks completed\n');
    return benchmarks;
  }

  private static async benchmarkNullifierGeneration(): Promise<any> {
    const iterations = 1000;
    const times: number[] = [];

    console.log(`   Benchmarking nullifier generation (${iterations} iterations)...`);

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Import here to avoid circular dependency issues
      const { SecureCryptographicNullifier } = await import('../cryptography/secureNullifier');
      const credentials = SecureCryptographicNullifier.generateSecureVoterCredentials();
      SecureCryptographicNullifier.generateSecureNullifier(credentials, `proposal_${i}`, i % 2);
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const sorted = times.sort((a, b) => a - b);
    return {
      iterations,
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: sorted[0],
      maxTime: sorted[sorted.length - 1],
      p95Time: sorted[Math.floor(sorted.length * 0.95)],
      p99Time: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  private static async benchmarkProofVerification(): Promise<any> {
    const iterations = 500;
    const times: number[] = [];

    console.log(`   Benchmarking proof verification (${iterations} iterations)...`);

    const { SecureCryptographicNullifier } = await import('../cryptography/secureNullifier');
    
    // Pre-generate proofs
    const proofs = [];
    for (let i = 0; i < iterations; i++) {
      const credentials = SecureCryptographicNullifier.generateSecureVoterCredentials();
      const proof = SecureCryptographicNullifier.generateSecureNullifier(
        credentials, `verification_test_${i}`, i % 2
      );
      proofs.push({ proof, proposalId: `verification_test_${i}` });
    }

    // Benchmark verification
    for (const { proof, proposalId } of proofs) {
      const startTime = performance.now();
      
      SecureCryptographicNullifier.verifyNullifierProof(
        proof, proposalId, 'benchmark_registry_root'
      );
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const sorted = times.sort((a, b) => a - b);
    return {
      iterations,
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: sorted[0],
      maxTime: sorted[sorted.length - 1],
      p95Time: sorted[Math.floor(sorted.length * 0.95)],
      p99Time: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  private static async benchmarkConcurrentOperations(): Promise<any> {
    const concurrencyLevels = [1, 5, 10, 25, 50, 100];
    const results: any = {};

    console.log('   Benchmarking concurrent operations...');

    for (const concurrency of concurrencyLevels) {
      const startTime = performance.now();
      
      const promises = Array.from({ length: concurrency }, async (_, i) => {
        const { SecureCryptographicNullifier } = await import('../cryptography/secureNullifier');
        const credentials = SecureCryptographicNullifier.generateSecureVoterCredentials();
        return SecureCryptographicNullifier.generateSecureNullifier(
          credentials, `concurrent_test_${i}`, i % 2
        );
      });

      await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      results[concurrency] = {
        totalTime,
        avgTimePerOperation: totalTime / concurrency,
        operationsPerSecond: (concurrency / totalTime) * 1000
      };
    }

    return results;
  }

  private static async benchmarkMemoryUsage(): Promise<any> {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const iterations = 1000;

    console.log('   Benchmarking memory usage...');

    // Generate many operations to test memory behavior
    for (let i = 0; i < iterations; i++) {
      const { SecureCryptographicNullifier } = await import('../cryptography/secureNullifier');
      const credentials = SecureCryptographicNullifier.generateSecureVoterCredentials();
      SecureCryptographicNullifier.generateSecureNullifier(credentials, `memory_test_${i}`, i % 2);
      
      // Occasional garbage collection if available
      if (i % 100 === 0 && global.gc) {
        global.gc();
      }
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    return {
      iterations,
      initialMemory,
      finalMemory,
      memoryIncrease,
      memoryPerOperation: memoryIncrease / iterations
    };
  }

  private static async benchmarkScalability(): Promise<any> {
    const { SecureNullifierRegistry } = await import('../cryptography/secureNullifier');
    const { SecureCryptographicNullifier } = await import('../cryptography/secureNullifier');
    
    const scales = [100, 500, 1000, 2000];
    const results: any = {};

    console.log('   Benchmarking scalability...');

    for (const scale of scales) {
      const registry = new SecureNullifierRegistry();
      const startTime = performance.now();

      // Add many entries to test scaling
      for (let i = 0; i < scale; i++) {
        const credentials = SecureCryptographicNullifier.generateSecureVoterCredentials();
        const proof = SecureCryptographicNullifier.generateSecureNullifier(
          credentials, `scale_test_${i}`, i % 2
        );
        registry.addNullifier(proof, `scale_test_${i}`);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Test integrity check performance
      const integrityStartTime = performance.now();
      registry.verifyRegistryIntegrity();
      const integrityEndTime = performance.now();
      const integrityTime = integrityEndTime - integrityStartTime;

      results[scale] = {
        totalTime,
        avgTimePerEntry: totalTime / scale,
        integrityCheckTime: integrityTime,
        entriesPerSecond: (scale / totalTime) * 1000
      };
    }

    return results;
  }

  private static compileValidationResults(data: any): CompetitionValidationResult {
    const {
      cryptographyResults,
      integrationResults,
      securityResults,
      penetrationResults,
      performanceBenchmarks,
      readinessAssessment,
      totalTime
    } = data;

    // Calculate overall score
    const cryptoScore = (cryptographyResults.passed / cryptographyResults.totalTests) * 100;
    const integrationScore = (integrationResults.passed / integrationResults.totalTests) * 100;
    const securityScore = securityResults.score;
    const penetrationScore = penetrationResults.systemSecure ? 100 : Math.max(0, 100 - penetrationResults.riskScore);
    const readinessScore = readinessAssessment.overallScore;

    const overallScore = (
      cryptoScore * 0.25 +
      integrationScore * 0.2 +
      securityScore * 0.25 +
      penetrationScore * 0.2 +
      readinessScore * 0.1
    );

    const competitionReady = overallScore >= 85 && 
                            securityResults.passed && 
                            penetrationResults.systemSecure;

    // Identify critical issues
    const criticalIssues: string[] = [];
    
    if (cryptographyResults.failed > 0) {
      criticalIssues.push(`${cryptographyResults.failed} cryptographic test failures`);
    }
    
    if (integrationResults.failed > 0) {
      criticalIssues.push(`${integrationResults.failed} integration test failures`);
    }
    
    if (!securityResults.passed) {
      criticalIssues.push('Security audit failed');
    }
    
    if (!penetrationResults.systemSecure) {
      criticalIssues.push(`${penetrationResults.successfulAttacks} successful penetration tests`);
    }

    // Generate recommendations
    const recommendations = [
      ...readinessAssessment.recommendations.slice(0, 3),
      'Implement continuous security monitoring',
      'Add comprehensive logging and alerting',
      'Conduct regular security audits',
      'Implement formal verification where possible',
      'Add distributed deployment capabilities'
    ];

    return {
      timestamp: Date.now(),
      overallScore: Math.round(overallScore),
      competitionReady,
      testResults: {
        cryptography: cryptographyResults,
        integration: integrationResults,
        security: securityResults,
        penetration: penetrationResults
      },
      performance: {
        metrics: PerformanceMonitor.getAllMetrics(),
        benchmarks: performanceBenchmarks
      },
      readiness: readinessAssessment,
      recommendations,
      criticalIssues
    };
  }

  private static printFinalSummary(result: CompetitionValidationResult): void {
    console.log('\n🏆 COMPETITION VALIDATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
    console.log(`Overall Score: ${result.overallScore}/100`);
    console.log(`Competition Ready: ${result.competitionReady ? '✅ YES' : '❌ NO'}`);

    console.log('\n📊 Test Results Summary:');
    console.log(`Cryptography Tests: ${result.testResults.cryptography.passed}/${result.testResults.cryptography.totalTests} passed`);
    console.log(`Integration Tests: ${result.testResults.integration.passed}/${result.testResults.integration.totalTests} passed`);
    console.log(`Security Audit: ${result.testResults.security.passed ? '✅ PASSED' : '❌ FAILED'} (Score: ${result.testResults.security.score}/100)`);
    console.log(`Penetration Testing: ${result.testResults.penetration.systemSecure ? '🛡️ SECURE' : '⚠️ VULNERABLE'} (${result.testResults.penetration.successfulAttacks} successful attacks)`);

    console.log('\n🚀 Performance Benchmarks:');
    const nullifierBench = result.performance.benchmarks.nullifierGeneration;
    const verificationBench = result.performance.benchmarks.proofVerification;
    console.log(`Nullifier Generation: ${nullifierBench.avgTime.toFixed(2)}ms avg (P95: ${nullifierBench.p95Time.toFixed(2)}ms)`);
    console.log(`Proof Verification: ${verificationBench.avgTime.toFixed(2)}ms avg (P95: ${verificationBench.p95Time.toFixed(2)}ms)`);

    if (result.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      result.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n💡 Top Recommendations:');
    result.recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    if (result.competitionReady) {
      console.log('\n🎉 CONGRATULATIONS! 🎉');
      console.log('Your system is ready for competition deployment!');
      console.log('All critical security and functionality tests have passed.');
    } else {
      console.log('\n⚠️ SYSTEM NEEDS IMPROVEMENT');
      console.log('Please address the critical issues before competition deployment.');
    }

    console.log('\n📈 Next Steps:');
    if (result.competitionReady) {
      console.log('1. Deploy to staging environment for final validation');
      console.log('2. Conduct user acceptance testing');
      console.log('3. Prepare monitoring and alerting for production');
      console.log('4. Create deployment and rollback procedures');
    } else {
      console.log('1. Address all critical issues identified above');
      console.log('2. Re-run validation suite to verify fixes');
      console.log('3. Implement recommended security improvements');
      console.log('4. Enhance test coverage for failing areas');
    }
  }

  // Quick validation for development
  static async runQuickValidation(): Promise<{ passed: boolean; score: number; issues: string[] }> {
    console.log('⚡ Running Quick Validation...\n');

    try {
      // Run essential tests only
      const cryptoResults = await CryptographyTestSuite.runAllTests();
      const securityResults = await SecurityAuditor.runFullSecurityAudit();

      const cryptoScore = (cryptoResults.passed / cryptoResults.totalTests) * 100;
      const securityScore = securityResults.score;
      const overallScore = (cryptoScore + securityScore) / 2;

      const issues: string[] = [];
      if (cryptoResults.failed > 0) {
        issues.push(`${cryptoResults.failed} crypto test failures`);
      }
      if (!securityResults.passed) {
        issues.push('Security audit failed');
      }

      const passed = overallScore >= 80 && issues.length === 0;

      console.log(`\n⚡ Quick Validation Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Score: ${overallScore.toFixed(1)}/100`);
      
      if (issues.length > 0) {
        console.log('Issues:', issues.join(', '));
      }

      return { passed, score: overallScore, issues };

    } catch (error) {
      console.error('Quick validation failed:', error);
      return { passed: false, score: 0, issues: ['Validation suite error'] };
    }
  }
}

export default CompetitionRunner;