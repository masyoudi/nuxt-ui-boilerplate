import { dot, slash, brackedOpen, colon, lT, equals } from '../specialchars.regex';

// Regex build with data of https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XSS%20Injection

const htmlTags = '(abbr|acronym|applet|area|audio|basefont|body|center|command|dfn|dir|embed|font|form|frame|frameset|html|iframe|ins|keygen|layer|line|listing|map|marquee|math|menu|menuitem|meta|meter|nav|nobr|noembed|noframes|nolayer|noscript|object|output|param|plaintext|progress|ruby|script|section|select|source|template|textarea|time|track|var|video|wbr|xmp|foreignObject)';
const jsEvents = '(onAbort|onActivate|onAfterPrint|onAfterUpdate|onBeforeActivate|onBeforeCopy|onBeforeCut|onBeforeDeactivate|onBeforeEditFocus|onBeforePaste|onBeforePrint|onBeforeUnload|onBeforeUpdate|onBegin|onBlur|onBounce|onCellChange|onChange|onClick|onContextMenu|onControlSelect|onCopy|onCut|onDataAvailable|onDataSetChanged|onDataSetComplete|onDblClick|onDeactivate|onDrag|onDragDrop|onDragEnd|onDragEnter|onDragLeave|onDragOver|onDragStart|onDrop|onEnd|onError|onErrorUpdate|onFilterChange|onFinish|onFocus|onFocusIn|onFocusOut|onHashChange|onHelp|onInput|onKeyDown|onKeyPress|onKeyUp|onLayoutComplete|onLoad|onLoseCapture|onMediaComplete|onMediaError|onMessage|onMouseDown|onMouseEnter|onMouseLeave|onMouseMove|onMouseOut|onMouseOver|onMouseUp|onMouseWheel|onMove|onMoveEnd|onMoveStart|onOffline|onOnline|onOutOfSync|onPaste|onPause|onPopState|onProgress|onPropertyChange|onReadyStateChange|onRedo|onRepeat|onReset|onResize|onResizeEnd|onResizeStart|onResume|onReverse|onRowDelete|onRowExit|onRowInserted|onRowsEnter|onScroll|onSeek|onSelect|onSelectStart|onSelectionChange|onStart|onStop|onStorage|onSubmit|onSyncRestored|onTimeError|onTrackChange|onURLFlip|onUndo|onUnload|seekSegmentTime)';
const functions = `(alert|call|confirm|console${dot}[a-zA-Z]{1,}|eval|fetch|prompt|setTimeout|setInterval|toString|url)`;

const regex = new RegExp(
  // eslint-disable-next-line no-useless-escape
  `(${lT}${slash}?(java)?script|${lT}${slash}?${htmlTags}|${functions}(${brackedOpen}|\`|(\\\\){1,2}x28)|(${brackedOpen}|${equals})${functions}|javascript${colon}|${lT}xss|${lT}${slash}?(\\\?|%3F)?xml|${lT}${slash}?dialog|(navigator|document|localStorage|process)${dot}\\\S|${jsEvents}${equals}|${lT}\\\??import|top\\[|${dot}(inner|outer)HTML|response${dot}write${brackedOpen})`,
  'i'
);

export default regex;
