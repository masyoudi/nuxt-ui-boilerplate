import { dot, slash, percent } from '../specialchars.regex';

// Regex build with data of https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Directory%20Traversal
const regex = new RegExp(
  `(${dot}{2,3};?${slash}|${slash};?${dot}{2,3}|${slash}(etc|proc|home|run|var|usr|root|bin|cgi-bin|windows|system32)${slash}|c(:|%3A|%253A)${slash}|${slash}${dot}${slash}|boot${dot}ini|${dot}htaccess|(file|zip|php|data).${slash}{2}|${percent}systemroot${percent})`,
  'i'
);

export default regex;
