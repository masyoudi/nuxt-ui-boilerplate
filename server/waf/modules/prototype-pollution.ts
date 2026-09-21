// Good explanation: https://book.hacktricks.xyz/pentesting-web/deserialization/nodejs-proto-prototype-pollution

import { underscore, dot, squareBracketOpen, squareBracketClose } from '../specialchars.regex';

const regex = new RegExp(
  `(${underscore}${underscore}proto${underscore}${underscore}|\\S${dot}prototype(${dot}|${squareBracketOpen})|${squareBracketOpen}prototype${squareBracketClose})`,
  'i'
);

export default regex;
