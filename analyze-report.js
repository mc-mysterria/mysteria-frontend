import fs from 'fs';
import path from 'path';

// Read the most recent report
const reportsDir = './performance-reports';
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
const latestFile = files.sort().pop();

if (!latestFile) {
  console.log('No Lighthouse reports found');
  process.exit(1);
}

console.log(`📊 Analyzing report: ${latestFile}\n`);

const data = JSON.parse(fs.readFileSync(path.join(reportsDir, latestFile), 'utf8'));
const categories = data.categories || {};
const audits = data.audits || {};

// Performance Scores
console.log('🎯 LIGHTHOUSE SCORES:');
console.log('='.repeat(40));
Object.entries(categories).forEach(([key, category]) => {
  const score = Math.round(category.score * 100);
  const emoji = score >= 90 ? '✅' : score >= 75 ? '⚠️' : '❌';
  console.log(`${category.title}: ${score}/100 ${emoji}`);
});

// Core Web Vitals
console.log('\n⚡ CORE WEB VITALS:');
console.log('='.repeat(40));

const fcp = audits['first-contentful-paint']?.numericValue / 1000;
const lcp = audits['largest-contentful-paint']?.numericValue / 1000;
const cls = audits['cumulative-layout-shift']?.numericValue;
const fid = audits['max-potential-fid']?.numericValue;

if (fcp) {
  const fcpEmoji = fcp <= 1.8 ? '✅' : fcp <= 3.0 ? '⚠️' : '❌';
  console.log(`First Contentful Paint: ${fcp.toFixed(2)}s ${fcpEmoji}`);
}

if (lcp) {
  const lcpEmoji = lcp <= 2.5 ? '✅' : lcp <= 4.0 ? '⚠️' : '❌';
  console.log(`Largest Contentful Paint: ${lcp.toFixed(2)}s ${lcpEmoji}`);
}

if (cls !== undefined) {
  const clsEmoji = cls <= 0.1 ? '✅' : cls <= 0.25 ? '⚠️' : '❌';
  console.log(`Cumulative Layout Shift: ${cls.toFixed(3)} ${clsEmoji}`);
}

if (fid) {
  const fidEmoji = fid <= 100 ? '✅' : fid <= 300 ? '⚠️' : '❌';
  console.log(`Max Potential FID: ${fid.toFixed(0)}ms ${fidEmoji}`);
}

// Performance Issues
console.log('\n🔧 PERFORMANCE OPPORTUNITIES:');
console.log('='.repeat(40));

const opportunities = Object.values(audits).filter(audit => 
  audit.details && audit.details.type === 'opportunity' && audit.numericValue > 100
);

if (opportunities.length > 0) {
  opportunities
    .sort((a, b) => b.numericValue - a.numericValue)
    .slice(0, 5)
    .forEach((opportunity, i) => {
      const savings = (opportunity.numericValue / 1000).toFixed(1);
      console.log(`${i + 1}. ${opportunity.title}`);
      console.log(`   💾 Potential savings: ${savings}s`);
    });
} else {
  console.log('🎉 No major optimization opportunities found!');
}

// Bundle Analysis
console.log('\n📦 RESOURCE ANALYSIS:');
console.log('='.repeat(40));

const networkRequests = audits['network-requests'];
if (networkRequests && networkRequests.details && networkRequests.details.items) {
  const resources = networkRequests.details.items;
  const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  console.log(`Total Resources: ${resources.length}`);
  console.log(`Total Transfer Size: ${(totalSize / 1024).toFixed(1)} KB`);
  
  // Show largest resources
  const largest = resources
    .filter(r => r.transferSize > 0)
    .sort((a, b) => b.transferSize - a.transferSize)
    .slice(0, 5);
  
  console.log('\n🏋️  Largest Resources:');
  largest.forEach(resource => {
    const name = resource.url.split('/').pop() || resource.url;
    const size = (resource.transferSize / 1024).toFixed(1);
    console.log(`• ${name}: ${size} KB`);
  });
}

// Specific Mysteria Issues
console.log('\n🎮 MYSTERIA-SPECIFIC ANALYSIS:');
console.log('='.repeat(40));

// Check for animation performance
const animatedContent = audits['non-composited-animations'];
if (animatedContent && animatedContent.score < 1) {
  console.log('⚠️  Animation performance issues detected:');
  console.log('   - Consider using CSS transforms for animations');
  console.log('   - Add will-change hints for animated elements');
} else {
  console.log('✅ Animations are GPU-accelerated');
}

// Check for main thread work
const mainThreadWork = audits['mainthread-work-breakdown'];
if (mainThreadWork && mainThreadWork.numericValue > 2000) {
  console.log(`⚠️  High main thread work: ${(mainThreadWork.numericValue / 1000).toFixed(1)}s`);
  console.log('   - Consider code splitting');
  console.log('   - Defer non-critical JavaScript');
} else {
  console.log('✅ Main thread work is optimized');
}

// Check for unused code
const unusedJS = audits['unused-javascript'];
const unusedCSS = audits['unused-css-rules'];

if (unusedJS && unusedJS.numericValue > 10000) {
  console.log(`⚠️  Unused JavaScript: ${(unusedJS.numericValue / 1024).toFixed(1)} KB`);
}
if (unusedCSS && unusedCSS.numericValue > 5000) {
  console.log(`⚠️  Unused CSS: ${(unusedCSS.numericValue / 1024).toFixed(1)} KB`);
}

console.log('\n🚀 NEXT STEPS:');
console.log('='.repeat(40));
const performanceScore = Math.round(categories.performance.score * 100);

if (performanceScore >= 90) {
  console.log('🎉 Excellent performance! Your optimizations are working well.');
  console.log('💡 Consider monitoring with Real User Monitoring (RUM)');
} else if (performanceScore >= 75) {
  console.log('👍 Good performance, but room for improvement:');
  console.log('1. Focus on the largest opportunities listed above');
  console.log('2. Test on slower devices/networks');
  console.log('3. Consider progressive loading for heavy components');
} else {
  console.log('🔧 Performance needs improvement:');
  console.log('1. Address the critical issues above');
  console.log('2. Run the benchmark.html for detailed analysis');
  console.log('3. Consider reducing bundle size and optimizing images');
}

console.log('\n📈 Open the HTML report for detailed analysis:');
console.log(`file://${path.resolve(reportsDir, latestFile.replace('.json', '.html'))}`);