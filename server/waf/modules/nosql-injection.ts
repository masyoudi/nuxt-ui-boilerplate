import {
  quotationMarks,
  singleQuotationMarks,
  curlyBracketOpen,
  squareBracketOpen,
  dollar,
  colon,
  squareBracketClose,
  dot,
  brackedOpen,
  underscore,
  or,
  equals,
  and
} from '../specialchars.regex';

const regex = new RegExp(
  `((${squareBracketOpen}|${curlyBracketOpen}(${quotationMarks}|${singleQuotationMarks})?(\\s+)?)${dollar}\\S+(${colon}|${squareBracketClose})|${dollar}(where|n?or|and|not|regex|eq|ne|gte?|lte?|n?in|exists|comment|expr|mod|size|rand)|db${dot}\\S+${dot}(find|findOne|insert|update|insertOne|insertMany|updateMany|updateOne|delete|deleteOne|deleteMany|drop|count)${brackedOpen}|sleep${brackedOpen}|db${dot}(getCollectionNames|dropDatabase)${brackedOpen}|${underscore}all${underscore}docs|this${dot}\\S+${dot}match${brackedOpen}|new\\sDate${brackedOpen}|${or}{2}\\s+\\d${equals}{2}\\d|${and}{2}\\s+this${dot})`,
  'i'
);

export default regex;
