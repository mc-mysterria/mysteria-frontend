#!/usr/bin/env node

/**
 * Performance Testing Script for Mysteria Frontend
 * 
 * This script provides automated performance testing using Lighthouse
 * Run with: node performance-test.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance targets based on your app requirements
const PERFORMANCE_TARGETS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 85,
  fcp: 1.8, // seconds
  lcp: 2.5, // seconds
  cls: 0.1,
  fid: 100 // milliseconds
};

async function runLighthouseTest(url = 'http://localhost:4173') {
  console.log('🚀 Running Lighthouse performance audit...');
  console.log(`📍 Testing URL: ${url}`);
  
  try {
    // Check if lighthouse is installed
    try {
      execSync('lighthouse --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('📦 Installing Lighthouse CLI...');
      execSync('npm install -g lighthouse', { stdio: 'inherit' });
    }

    // Create reports directory
    const reportsDir = path.join(__dirname, 'performance-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `lighthouse-${timestamp}.html`);
    const jsonPath = path.join(reportsDir, `lighthouse-${timestamp}.json`);

    // Run Lighthouse audit
    const lighthouseCmd = `lighthouse ${url} --output=html,json --output-path=${reportPath.replace('.html', '')} --chrome-flags="--headless --no-sandbox" --throttling-method=devtools`;
    
    console.log('⏳ Running audit (this may take 30-60 seconds)...');
    execSync(lighthouseCmd, { stdio: 'inherit' });

    // Read and analyze results
    const jsonResults = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    analyzeResults(jsonResults);

    console.log(`\n📊 Full report saved to: ${reportPath}`);
    console.log(`📄 JSON results saved to: ${jsonPath}`);
    
    return jsonResults;
  } catch (error) {
    console.error('❌ Error running Lighthouse:', error.message);
    throw error;
  }
}

function analyzeResults(results) {
  console.log('\n📈 Performance Analysis Results:');
  console.log('='.repeat(50));

  // Core Web Vitals
  const audits = results.lhr.audits;
  const categories = results.lhr.categories;

  // Main scores
  console.log('\n🎯 Lighthouse Scores:');
  Object.entries(categories).forEach(([key, category]) => {
    const score = Math.round(category.score * 100);
    const target = PERFORMANCE_TARGETS[key] || 80;
    const status = score >= target ? '✅' : '❌';
    console.log(`  ${category.title}: ${score}/100 ${status} (target: ${target})`);
  });

  // Core Web Vitals
  console.log('\n⚡ Core Web Vitals:');
  
  const fcp = audits['first-contentful-paint']?.numericValue / 1000;
  const lcp = audits['largest-contentful-paint']?.numericValue / 1000;
  const cls = audits['cumulative-layout-shift']?.numericValue;
  const fid = audits['max-potential-fid']?.numericValue;

  if (fcp) {
    const fcpStatus = fcp <= PERFORMANCE_TARGETS.fcp ? '✅' : '❌';
    console.log(`  First Contentful Paint: ${fcp.toFixed(2)}s ${fcpStatus} (target: ${PERFORMANCE_TARGETS.fcp}s)`);
  }

  if (lcp) {
    const lcpStatus = lcp <= PERFORMANCE_TARGETS.lcp ? '✅' : '❌';
    console.log(`  Largest Contentful Paint: ${lcp.toFixed(2)}s ${lcpStatus} (target: ${PERFORMANCE_TARGETS.lcp}s)`);
  }

  if (cls !== undefined) {
    const clsStatus = cls <= PERFORMANCE_TARGETS.cls ? '✅' : '❌';
    console.log(`  Cumulative Layout Shift: ${cls.toFixed(3)} ${clsStatus} (target: ${PERFORMANCE_TARGETS.cls})`);
  }

  if (fid) {
    const fidStatus = fid <= PERFORMANCE_TARGETS.fid ? '✅' : '❌';
    console.log(`  Max Potential First Input Delay: ${fid.toFixed(0)}ms ${fidStatus} (target: ${PERFORMANCE_TARGETS.fid}ms)`);
  }

  // Performance opportunities
  console.log('\n🔧 Performance Opportunities:');
  const opportunities = Object.values(audits).filter(audit => 
    audit.details && audit.details.type === 'opportunity' && audit.numericValue > 100
  );

  if (opportunities.length > 0) {
    opportunities
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 5)
      .forEach(opportunity => {
        const savings = (opportunity.numericValue / 1000).toFixed(1);
        console.log(`  • ${opportunity.title}: ${savings}s potential savings`);
      });
  } else {
    console.log('  🎉 No major optimization opportunities found!');
  }

  // Bundle analysis
  console.log('\n📦 Bundle Analysis:');
  const unusedCSS = audits['unused-css-rules'];
  const unusedJS = audits['unused-javascript'];
  
  if (unusedCSS && unusedCSS.numericValue > 0) {
    const cssSavings = (unusedCSS.numericValue / 1024).toFixed(1);
    console.log(`  ⚠️  Unused CSS: ${cssSavings} KB`);
  }
  
  if (unusedJS && unusedJS.numericValue > 0) {
    const jsSavings = (unusedJS.numericValue / 1024).toFixed(1);
    console.log(`  ⚠️  Unused JavaScript: ${jsSavings} KB`);
  }

  // Mobile-specific warnings
  if (results.lhr.configSettings.emulatedFormFactor === 'mobile') {
    console.log('\n📱 Mobile Performance:');
    const mobileScore = Math.round(categories.performance.score * 100);
    if (mobileScore < 80) {
      console.log(`  ⚠️  Mobile performance score is low (${mobileScore}/100)`);
      console.log('     Consider reducing JavaScript execution time');
      console.log('     Optimize images for mobile devices');
      console.log('     Reduce network payload sizes');
    }
  }

  generateRecommendations(results);
}

function generateRecommendations(results) {
  console.log('\n💡 Mysteria-Specific Recommendations:');
  console.log('=' .repeat(50));

  const audits = results.lhr.audits;
  const performanceScore = Math.round(results.lhr.categories.performance.score * 100);

  if (performanceScore < 90) {
    console.log('\n🎯 Priority Fixes:');
    
    // Check for cursor tracking performance impact
    if (audits['efficient-animated-content'] && audits['efficient-animated-content'].score < 1) {
      console.log('  1. Optimize cursor tracking animation:');
      console.log('     - Already using requestAnimationFrame ✅');
      console.log('     - Consider reducing cursor size on mobile');
      console.log('     - Add will-change: transform to cursor element');
    }

    // Check for background animation impact
    if (audits['non-composited-animations'] && audits['non-composited-animations'].score < 1) {
      console.log('  2. Optimize MysticBackground animations:');
      console.log('     - Use transform instead of changing position properties');
      console.log('     - Add will-change hints for animated elements');
      console.log('     - Consider reducing animation complexity on mobile');
    }

    // Check bundle size
    const mainThreadWork = audits['mainthread-work-breakdown']?.numericValue;
    if (mainThreadWork && mainThreadWork > 2000) {
      console.log('  3. Reduce JavaScript execution time:');
      console.log('     - Implement code splitting for larger views');
      console.log('     - Defer non-critical JavaScript');
      console.log('     - Optimize store watchers (already improved with debouncing ✅)');
    }

    // Font loading
    if (audits['font-display'] && audits['font-display'].score < 1) {
      console.log('  4. Optimize font loading:');
      console.log('     - font-display: swap already implemented ✅');
      console.log('     - Consider preloading critical fonts');
      console.log('     - Reduce number of font variants if possible');
    }
  }

  console.log('\n🚀 Additional Optimizations:');
  console.log('  • Implement service worker for caching');
  console.log('  • Enable gzip/brotli compression on server');
  console.log('  • Use CDN for static assets');
  console.log('  • Consider lazy loading non-critical components');
  console.log('  • Monitor performance with Real User Monitoring (RUM)');

  // Already implemented optimizations
  console.log('\n✅ Good practices already implemented:');
  console.log('  • Debounced store watchers');
  console.log('  • RequestAnimationFrame for cursor tracking');
  console.log('  • Reduced motion preferences respected');
  console.log('  • Mobile-optimized animations');
  console.log('  • Hardware acceleration hints');
  console.log('  • Bundle splitting configured');
}

async function runBuildAndTest() {
  console.log('🔨 Building production version...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');

    console.log('\n🌐 Starting preview server...');
    const preview = execSync('npm run preview &', { stdio: 'pipe' });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Run Lighthouse test
    await runLighthouseTest();

  } catch (error) {
    console.error('❌ Error during build and test:', error.message);
  }
}

async function runMobileTest() {
  console.log('📱 Running mobile performance test...');
  
  const lighthouseCmd = `lighthouse http://localhost:4173 --output=html,json --output-path=./performance-reports/mobile-test --emulated-form-factor=mobile --throttling-method=devtools --chrome-flags="--headless --no-sandbox"`;
  
  try {
    execSync(lighthouseCmd, { stdio: 'inherit' });
    console.log('✅ Mobile test completed');
  } catch (error) {
    console.error('❌ Mobile test failed:', error.message);
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0] || 'test';

switch (command) {
  case 'build':
    runBuildAndTest();
    break;
  case 'mobile':
    runMobileTest();
    break;
  case 'test':
  default:
    if (args[1]) {
      runLighthouseTest(args[1]);
    } else {
      console.log('🔗 Make sure your preview server is running (npm run preview)');
      console.log('📍 Testing default URL: http://localhost:4173');
      runLighthouseTest();
    }
    break;
}

export { runLighthouseTest, analyzeResults };