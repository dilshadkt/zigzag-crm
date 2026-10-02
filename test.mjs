import { normalizeWorkDetails, matchStandardWorkType } from './src/components/projects/workDetailsForm/workTypeMapping.js'; 

const data = [{
  month: '2024-10', 
  reels: {count:0, total:0}, 
  other: [{name: 'Short-form videos (Reels/Shorts)', count: 2, total: 4}]
}];

console.log("Match:", matchStandardWorkType("Short-form videos (Reels/Shorts)"));
console.log(JSON.stringify(normalizeWorkDetails(data), null, 2));
