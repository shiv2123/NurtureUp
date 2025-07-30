#!/usr/bin/env ts-node

import { TestRunner } from './tests/utils/test-runner';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🧪 NurtureUp Backend Testing Suite');
  console.log('==================================\n');

  const runner = new TestRunner();
  
  try {
    // Run all tests and get summary
    const summary = await runner.runAllTests();
    
    // Generate report
    const report = runner.generateReport(summary);
    
    // Display report
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(__dirname, 'test-report.txt');
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}\n`);
    
    // Exit with appropriate code
    if (summary.failedTests > 0) {
      console.log('❌ Some tests failed. Please review and fix the issues.');
      process.exit(1);
    } else {
      console.log('✅ All tests passed! Backend is ready for production.');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Test runner encountered an error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}