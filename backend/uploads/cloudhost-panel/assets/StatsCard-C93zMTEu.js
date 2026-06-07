import{k as e,l as s,j as t}from"./index-Do1nvYC6.js";
/**
 * @license lucide-react v0.298.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=e("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]),l=e("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);
/**
 * @license lucide-react v0.298.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function a({icon:e,label:a,value:n,subvalue:r,trend:x,color:c}){return s.jsxs("div",{className:"card-hover group",children:[s.jsxs("div",{className:"flex items-start justify-between",children:[s.jsx("div",{className:t("p-3 rounded-xl",c||"bg-primary-500/10"),children:s.jsx(e,{size:22,className:c?"text-white":"text-primary-400"})}),x&&s.jsx("div",{className:t("flex items-center gap-1 text-sm","up"===x?"text-green-400":"text-red-400"),children:"up"===x?s.jsx(l,{size:16}):s.jsx(i,{size:16})})]}),s.jsxs("div",{className:"mt-3",children:[s.jsx("p",{className:"text-2xl font-bold text-white",children:n}),s.jsx("p",{className:"text-sm text-gray-400 mt-0.5",children:a}),r&&s.jsx("p",{className:"text-xs text-gray-500 mt-1",children:r})]})]})}export{a as S,l as T};
