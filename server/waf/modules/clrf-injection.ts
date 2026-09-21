import { colon, minus } from '../specialchars.regex';

const responseHeader = `Set${minus}Cookie|Content${minus}(Length|Type|Location|Disposition|Security${minus}Policy)|X${minus}XSS${minus}Protection|Last${minus}Modified|Location|Date|Link|Refresh`;

const regex = new RegExp(
  `((\\r|%0D|%E5%98%8D|\\\\u560d|%250D)|(\\n|%0A|%E5%98%8A|\\\\u560a|%250a))[\\t ]*(${responseHeader})[\\t ]*${colon}`,
  'i'
);

export default regex;
