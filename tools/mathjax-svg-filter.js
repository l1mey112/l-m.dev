#!/usr/bin/env node
"use strict";

/*

npm install github:jgm/mathjax-svg-filter

pandoc ~/remote/everything/Study/\(..CAn\)\ Complex\ Analysis\ \(2621\)/'(3.3) Exponential function.md' \
  --filter ./node_modules/.bin/mathjax-svg-filter -o out.html

esbuild --build ./node_modules/.bin/mathjax-svg-filter > mathjax-svg-filter.js

*/

(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/get-stdin/index.js
  var require_get_stdin = __commonJS({
    "node_modules/get-stdin/index.js"(exports2, module2) {
      "use strict";
      var { stdin } = process;
      module2.exports = () => {
        let result = "";
        return new Promise((resolve) => {
          if (stdin.isTTY) {
            resolve(result);
            return;
          }
          stdin.setEncoding("utf8");
          stdin.on("readable", () => {
            let chunk;
            while (chunk = stdin.read()) {
              result += chunk;
            }
          });
          stdin.on("end", () => {
            resolve(result);
          });
        });
      };
      module2.exports.buffer = () => {
        const result = [];
        let length = 0;
        return new Promise((resolve) => {
          if (stdin.isTTY) {
            resolve(Buffer.concat([]));
            return;
          }
          stdin.on("readable", () => {
            let chunk;
            while (chunk = stdin.read()) {
              result.push(chunk);
              length += chunk.length;
            }
          });
          stdin.on("end", () => {
            resolve(Buffer.concat(result, length));
          });
        });
      };
    }
  });

  // node_modules/pandoc-filter/index.js
  var require_pandoc_filter = __commonJS({
    "node_modules/pandoc-filter/index.js"(exports2) {
      "use strict";
      var __importDefault = exports2 && exports2.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      var get_stdin_1 = __importDefault(require_get_stdin());
      async function toJSONFilter(action2) {
        const json = await get_stdin_1.default();
        var data = JSON.parse(json);
        var format = process.argv.length > 2 ? process.argv[2] : "";
        filter(data, action2, format).then((output) => process.stdout.write(JSON.stringify(output)));
      }
      exports2.toJSONFilter = toJSONFilter;
      function isElt(x) {
        return typeof x === "object" && x && "t" in x || false;
      }
      function isEltArray(x) {
        return x.every(isElt);
      }
      async function walk(x, action2, format, meta) {
        if (typeof action2 === "function")
          action2 = { single: action2 };
        if (Array.isArray(x)) {
          if (action2.array && isEltArray(x)) {
            x = await action2.array(x, format, meta);
            if (!Array.isArray(x))
              throw "impossible (just for ts)";
          }
          var array = [];
          for (const item of x) {
            if (isElt(item) && action2.single) {
              var res = await action2.single(item, format, meta) || item;
              if (Array.isArray(res)) {
                for (const z of res) {
                  array.push(await walk(z, action2, format, meta));
                }
              } else {
                array.push(await walk(res, action2, format, meta));
              }
            } else {
              array.push(await walk(item, action2, format, meta));
            }
          }
          return array;
        } else if (typeof x === "object" && x !== null) {
          var obj = {};
          for (const k of Object.keys(x)) {
            obj[k] = await walk(x[k], action2, format, meta);
          }
          return obj;
        }
        return x;
      }
      exports2.walk = walk;
      function walkSync(x, action2, format, meta) {
        if (Array.isArray(x)) {
          var array = [];
          for (const item of x) {
            if (isElt(item)) {
              var res = action2(item, format, meta) || item;
              if (Array.isArray(res)) {
                for (const z of res) {
                  array.push(walkSync(z, action2, format, meta));
                }
              } else {
                array.push(walkSync(res, action2, format, meta));
              }
            } else {
              array.push(walkSync(item, action2, format, meta));
            }
          }
          return array;
        } else if (typeof x === "object" && x !== null) {
          var obj = {};
          for (const k of Object.keys(x)) {
            obj[k] = walkSync(x[k], action2, format, meta);
          }
          return obj;
        }
        return x;
      }
      exports2.walkSync = walkSync;
      function stringify(x) {
        if (!Array.isArray(x) && x.t === "MetaString")
          return x.c;
        var result = [];
        var go = function(e) {
          if (e.t === "Str")
            result.push(e.c);
          else if (e.t === "Code")
            result.push(e.c[1]);
          else if (e.t === "Math")
            result.push(e.c[1]);
          else if (e.t === "LineBreak")
            result.push(" ");
          else if (e.t === "Space")
            result.push(" ");
          else if (e.t === "SoftBreak")
            result.push(" ");
          else if (e.t === "Para")
            result.push("\n");
        };
        walkSync(x, go, "", {});
        return result.join("");
      }
      exports2.stringify = stringify;
      function attributes(attrs) {
        attrs = attrs || {};
        var ident = attrs.id || "";
        var classes = attrs.classes || [];
        var keyvals = [];
        Object.keys(attrs).forEach(function(k) {
          if (k !== "classes" && k !== "id")
            keyvals.push([k, attrs[k]]);
        });
        return [ident, classes, keyvals];
      }
      exports2.attributes = attributes;
      function elt(eltType, numargs) {
        return function(...args) {
          var len = args.length;
          if (len !== numargs)
            throw eltType + " expects " + numargs + " arguments, but given " + len;
          return { t: eltType, c: len === 1 ? args[0] : args };
        };
      }
      exports2.elt = elt;
      async function filter(data, action2, format) {
        return await walk(data, action2, format, data.meta || data[0].unMeta);
      }
      exports2.filter = filter;
      function rawToMeta(e) {
        if (Array.isArray(e)) {
          return { t: "MetaList", c: e.map((x) => rawToMeta(x)) };
        }
        if (typeof e === "string" || typeof e === "number")
          return { t: "MetaString", c: String(e) };
        if (typeof e === "object") {
          const c = fromEntries(Object.entries(e).map(([k, v]) => [k, rawToMeta(v)]));
          return { t: "MetaMap", c };
        }
        if (typeof e === "boolean")
          return { t: "MetaBool", c: e };
        throw Error(typeof e);
      }
      exports2.rawToMeta = rawToMeta;
      function metaToRaw(m) {
        if (m.t === "MetaMap") {
          return fromEntries(Object.entries(m.c).map(([k, v]) => [k, metaToRaw(v)]));
        } else if (m.t === "MetaList") {
          return m.c.map(metaToRaw);
        } else if (m.t === "MetaBool" || m.t === "MetaString") {
          return m.c;
        } else if (m.t === "MetaInlines" || m.t === "MetaBlocks") {
          return stringify(m.c);
        }
        throw Error(`Unknown meta type ${m.t}`);
      }
      exports2.metaToRaw = metaToRaw;
      function metaMapToRaw(c) {
        return metaToRaw({ t: "MetaMap", c });
      }
      exports2.metaMapToRaw = metaMapToRaw;
      function fromEntries(iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
          obj[key] = val;
          return obj;
        }, {});
      }
      exports2.Plain = elt("Plain", 1);
      exports2.Para = elt("Para", 1);
      exports2.CodeBlock = elt("CodeBlock", 2);
      exports2.RawBlock = elt("RawBlock", 2);
      exports2.BlockQuote = elt("BlockQuote", 1);
      exports2.OrderedList = elt("OrderedList", 2);
      exports2.BulletList = elt("BulletList", 1);
      exports2.DefinitionList = elt("DefinitionList", 1);
      exports2.Header = elt("Header", 3);
      exports2.HorizontalRule = elt("HorizontalRule", 0);
      exports2.Table = elt("Table", 6);
      exports2.Figure = elt("Figure", 3);
      exports2.Div = elt("Div", 2);
      exports2.Null = elt("Null", 0);
      exports2.Str = elt("Str", 1);
      exports2.Emph = elt("Emph", 1);
      exports2.Strong = elt("Strong", 1);
      exports2.Strikeout = elt("Strikeout", 1);
      exports2.Superscript = elt("Superscript", 1);
      exports2.Subscript = elt("Subscript", 1);
      exports2.SmallCaps = elt("SmallCaps", 1);
      exports2.Quoted = elt("Quoted", 2);
      exports2.Cite = elt("Cite", 2);
      exports2.Code = elt("Code", 2);
      exports2.Space = elt("Space", 0);
      exports2.LineBreak = elt("LineBreak", 0);
      exports2.Formula = elt("Math", 2);
      exports2.RawInline = elt("RawInline", 2);
      exports2.Link = elt("Link", 3);
      exports2.Image = elt("Image", 3);
      exports2.Note = elt("Note", 1);
      exports2.Span = elt("Span", 2);
      exports2.stdio = toJSONFilter;
    }
  });

  // node_modules/@xmldom/xmldom/lib/conventions.js
  var require_conventions = __commonJS({
    "node_modules/@xmldom/xmldom/lib/conventions.js"(exports2) {
      "use strict";
      function find(list, predicate, ac) {
        if (ac === void 0) {
          ac = Array.prototype;
        }
        if (list && typeof ac.find === "function") {
          return ac.find.call(list, predicate);
        }
        for (var i = 0; i < list.length; i++) {
          if (hasOwn(list, i)) {
            var item = list[i];
            if (predicate.call(void 0, item, i, list)) {
              return item;
            }
          }
        }
      }
      function freeze(object, oc) {
        if (oc === void 0) {
          oc = Object;
        }
        if (oc && typeof oc.getOwnPropertyDescriptors === "function") {
          object = oc.create(null, oc.getOwnPropertyDescriptors(object));
        }
        return oc && typeof oc.freeze === "function" ? oc.freeze(object) : object;
      }
      function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
      }
      function assign(target, source) {
        if (target === null || typeof target !== "object") {
          throw new TypeError("target is not an object");
        }
        for (var key in source) {
          if (hasOwn(source, key)) {
            target[key] = source[key];
          }
        }
        return target;
      }
      var HTML_BOOLEAN_ATTRIBUTES = freeze({
        allowfullscreen: true,
        async: true,
        autofocus: true,
        autoplay: true,
        checked: true,
        controls: true,
        default: true,
        defer: true,
        disabled: true,
        formnovalidate: true,
        hidden: true,
        ismap: true,
        itemscope: true,
        loop: true,
        multiple: true,
        muted: true,
        nomodule: true,
        novalidate: true,
        open: true,
        playsinline: true,
        readonly: true,
        required: true,
        reversed: true,
        selected: true
      });
      function isHTMLBooleanAttribute(name) {
        return hasOwn(HTML_BOOLEAN_ATTRIBUTES, name.toLowerCase());
      }
      var HTML_VOID_ELEMENTS = freeze({
        area: true,
        base: true,
        br: true,
        col: true,
        embed: true,
        hr: true,
        img: true,
        input: true,
        link: true,
        meta: true,
        param: true,
        source: true,
        track: true,
        wbr: true
      });
      function isHTMLVoidElement(tagName) {
        return hasOwn(HTML_VOID_ELEMENTS, tagName.toLowerCase());
      }
      var HTML_RAW_TEXT_ELEMENTS = freeze({
        script: false,
        style: false,
        textarea: true,
        title: true
      });
      function isHTMLRawTextElement(tagName) {
        var key = tagName.toLowerCase();
        return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && !HTML_RAW_TEXT_ELEMENTS[key];
      }
      function isHTMLEscapableRawTextElement(tagName) {
        var key = tagName.toLowerCase();
        return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && HTML_RAW_TEXT_ELEMENTS[key];
      }
      function isHTMLMimeType(mimeType) {
        return mimeType === MIME_TYPE.HTML;
      }
      function hasDefaultHTMLNamespace(mimeType) {
        return isHTMLMimeType(mimeType) || mimeType === MIME_TYPE.XML_XHTML_APPLICATION;
      }
      var MIME_TYPE = freeze({
        /**
         * `text/html`, the only mime type that triggers treating an XML document as HTML.
         *
         * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
         * @see https://en.wikipedia.org/wiki/HTML Wikipedia
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
         * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
         *      WHATWG HTML Spec
         */
        HTML: "text/html",
        /**
         * `application/xml`, the standard mime type for XML documents.
         *
         * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType
         *      registration
         * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
         * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
         */
        XML_APPLICATION: "application/xml",
        /**
         * `text/xml`, an alias for `application/xml`.
         *
         * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
         * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
         * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
         */
        XML_TEXT: "text/xml",
        /**
         * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
         * but is parsed as an XML document.
         *
         * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType
         *      registration
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
         * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
         */
        XML_XHTML_APPLICATION: "application/xhtml+xml",
        /**
         * `image/svg+xml`,
         *
         * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
         * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
         * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
         */
        XML_SVG_IMAGE: "image/svg+xml"
      });
      var _MIME_TYPES = Object.keys(MIME_TYPE).map(function(key) {
        return MIME_TYPE[key];
      });
      function isValidMimeType(mimeType) {
        return _MIME_TYPES.indexOf(mimeType) > -1;
      }
      var NAMESPACE = freeze({
        /**
         * The XHTML namespace.
         *
         * @see http://www.w3.org/1999/xhtml
         */
        HTML: "http://www.w3.org/1999/xhtml",
        /**
         * The SVG namespace.
         *
         * @see http://www.w3.org/2000/svg
         */
        SVG: "http://www.w3.org/2000/svg",
        /**
         * The `xml:` namespace.
         *
         * @see http://www.w3.org/XML/1998/namespace
         */
        XML: "http://www.w3.org/XML/1998/namespace",
        /**
         * The `xmlns:` namespace.
         *
         * @see https://www.w3.org/2000/xmlns/
         */
        XMLNS: "http://www.w3.org/2000/xmlns/"
      });
      exports2.assign = assign;
      exports2.find = find;
      exports2.freeze = freeze;
      exports2.HTML_BOOLEAN_ATTRIBUTES = HTML_BOOLEAN_ATTRIBUTES;
      exports2.HTML_RAW_TEXT_ELEMENTS = HTML_RAW_TEXT_ELEMENTS;
      exports2.HTML_VOID_ELEMENTS = HTML_VOID_ELEMENTS;
      exports2.hasDefaultHTMLNamespace = hasDefaultHTMLNamespace;
      exports2.hasOwn = hasOwn;
      exports2.isHTMLBooleanAttribute = isHTMLBooleanAttribute;
      exports2.isHTMLRawTextElement = isHTMLRawTextElement;
      exports2.isHTMLEscapableRawTextElement = isHTMLEscapableRawTextElement;
      exports2.isHTMLMimeType = isHTMLMimeType;
      exports2.isHTMLVoidElement = isHTMLVoidElement;
      exports2.isValidMimeType = isValidMimeType;
      exports2.MIME_TYPE = MIME_TYPE;
      exports2.NAMESPACE = NAMESPACE;
    }
  });

  // node_modules/@xmldom/xmldom/lib/errors.js
  var require_errors = __commonJS({
    "node_modules/@xmldom/xmldom/lib/errors.js"(exports2) {
      "use strict";
      var conventions = require_conventions();
      function extendError(constructor, writableName) {
        constructor.prototype = Object.create(Error.prototype, {
          constructor: { value: constructor },
          name: { value: constructor.name, enumerable: true, writable: writableName }
        });
      }
      var DOMExceptionName = conventions.freeze({
        /**
         * the default value as defined by the spec
         */
        Error: "Error",
        /**
         * @deprecated
         * Use RangeError instead.
         */
        IndexSizeError: "IndexSizeError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        DomstringSizeError: "DomstringSizeError",
        HierarchyRequestError: "HierarchyRequestError",
        WrongDocumentError: "WrongDocumentError",
        InvalidCharacterError: "InvalidCharacterError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        NoDataAllowedError: "NoDataAllowedError",
        NoModificationAllowedError: "NoModificationAllowedError",
        NotFoundError: "NotFoundError",
        NotSupportedError: "NotSupportedError",
        InUseAttributeError: "InUseAttributeError",
        InvalidStateError: "InvalidStateError",
        SyntaxError: "SyntaxError",
        InvalidModificationError: "InvalidModificationError",
        NamespaceError: "NamespaceError",
        /**
         * @deprecated
         * Use TypeError for invalid arguments,
         * "NotSupportedError" DOMException for unsupported operations,
         * and "NotAllowedError" DOMException for denied requests instead.
         */
        InvalidAccessError: "InvalidAccessError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        ValidationError: "ValidationError",
        /**
         * @deprecated
         * Use TypeError instead.
         */
        TypeMismatchError: "TypeMismatchError",
        SecurityError: "SecurityError",
        NetworkError: "NetworkError",
        AbortError: "AbortError",
        /**
         * @deprecated
         * Just to match the related static code, not part of the spec.
         */
        URLMismatchError: "URLMismatchError",
        QuotaExceededError: "QuotaExceededError",
        TimeoutError: "TimeoutError",
        InvalidNodeTypeError: "InvalidNodeTypeError",
        DataCloneError: "DataCloneError",
        EncodingError: "EncodingError",
        NotReadableError: "NotReadableError",
        UnknownError: "UnknownError",
        ConstraintError: "ConstraintError",
        DataError: "DataError",
        TransactionInactiveError: "TransactionInactiveError",
        ReadOnlyError: "ReadOnlyError",
        VersionError: "VersionError",
        OperationError: "OperationError",
        NotAllowedError: "NotAllowedError",
        OptOutError: "OptOutError"
      });
      var DOMExceptionNames = Object.keys(DOMExceptionName);
      function isValidDomExceptionCode(value) {
        return typeof value === "number" && value >= 1 && value <= 25;
      }
      function endsWithError(value) {
        return typeof value === "string" && value.substring(value.length - DOMExceptionName.Error.length) === DOMExceptionName.Error;
      }
      function DOMException(messageOrCode, nameOrMessage) {
        if (isValidDomExceptionCode(messageOrCode)) {
          this.name = DOMExceptionNames[messageOrCode];
          this.message = nameOrMessage || "";
        } else {
          this.message = messageOrCode;
          this.name = endsWithError(nameOrMessage) ? nameOrMessage : DOMExceptionName.Error;
        }
        if (Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
      }
      extendError(DOMException, true);
      Object.defineProperties(DOMException.prototype, {
        code: {
          enumerable: true,
          get: function() {
            var code = DOMExceptionNames.indexOf(this.name);
            if (isValidDomExceptionCode(code)) return code;
            return 0;
          }
        }
      });
      var ExceptionCode = {
        INDEX_SIZE_ERR: 1,
        DOMSTRING_SIZE_ERR: 2,
        HIERARCHY_REQUEST_ERR: 3,
        WRONG_DOCUMENT_ERR: 4,
        INVALID_CHARACTER_ERR: 5,
        NO_DATA_ALLOWED_ERR: 6,
        NO_MODIFICATION_ALLOWED_ERR: 7,
        NOT_FOUND_ERR: 8,
        NOT_SUPPORTED_ERR: 9,
        INUSE_ATTRIBUTE_ERR: 10,
        INVALID_STATE_ERR: 11,
        SYNTAX_ERR: 12,
        INVALID_MODIFICATION_ERR: 13,
        NAMESPACE_ERR: 14,
        INVALID_ACCESS_ERR: 15,
        VALIDATION_ERR: 16,
        TYPE_MISMATCH_ERR: 17,
        SECURITY_ERR: 18,
        NETWORK_ERR: 19,
        ABORT_ERR: 20,
        URL_MISMATCH_ERR: 21,
        QUOTA_EXCEEDED_ERR: 22,
        TIMEOUT_ERR: 23,
        INVALID_NODE_TYPE_ERR: 24,
        DATA_CLONE_ERR: 25
      };
      var entries = Object.entries(ExceptionCode);
      for (i = 0; i < entries.length; i++) {
        key = entries[i][0];
        DOMException[key] = entries[i][1];
      }
      var key;
      var i;
      function ParseError(message, locator) {
        this.message = message;
        this.locator = locator;
        if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
      }
      extendError(ParseError);
      exports2.DOMException = DOMException;
      exports2.DOMExceptionName = DOMExceptionName;
      exports2.ExceptionCode = ExceptionCode;
      exports2.ParseError = ParseError;
    }
  });

  // node_modules/@xmldom/xmldom/lib/grammar.js
  var require_grammar = __commonJS({
    "node_modules/@xmldom/xmldom/lib/grammar.js"(exports2) {
      "use strict";
      function detectUnicodeSupport(RegExpImpl) {
        try {
          if (typeof RegExpImpl !== "function") {
            RegExpImpl = RegExp;
          }
          var match = new RegExpImpl("\u{1D306}", "u").exec("\u{1D306}");
          return !!match && match[0].length === 2;
        } catch (error) {
        }
        return false;
      }
      var UNICODE_SUPPORT = detectUnicodeSupport();
      function chars(regexp) {
        if (regexp.source[0] !== "[") {
          throw new Error(regexp + " can not be used with chars");
        }
        return regexp.source.slice(1, regexp.source.lastIndexOf("]"));
      }
      function chars_without(regexp, search) {
        if (regexp.source[0] !== "[") {
          throw new Error("/" + regexp.source + "/ can not be used with chars_without");
        }
        if (!search || typeof search !== "string") {
          throw new Error(JSON.stringify(search) + " is not a valid search");
        }
        if (regexp.source.indexOf(search) === -1) {
          throw new Error('"' + search + '" is not is /' + regexp.source + "/");
        }
        if (search === "-" && regexp.source.indexOf(search) !== 1) {
          throw new Error('"' + search + '" is not at the first postion of /' + regexp.source + "/");
        }
        return new RegExp(regexp.source.replace(search, ""), UNICODE_SUPPORT ? "u" : "");
      }
      function reg(args) {
        var self = this;
        return new RegExp(
          Array.prototype.slice.call(arguments).map(function(part) {
            var isStr = typeof part === "string";
            if (isStr && self === void 0 && part === "|") {
              throw new Error("use regg instead of reg to wrap expressions with `|`!");
            }
            return isStr ? part : part.source;
          }).join(""),
          UNICODE_SUPPORT ? "mu" : "m"
        );
      }
      function regg(args) {
        if (arguments.length === 0) {
          throw new Error("no parameters provided");
        }
        return reg.apply(regg, ["(?:"].concat(Array.prototype.slice.call(arguments), [")"]));
      }
      var UNICODE_REPLACEMENT_CHARACTER = "\uFFFD";
      var Char = /[-\x09\x0A\x0D\x20-\x2C\x2E-\uD7FF\uE000-\uFFFD]/;
      if (UNICODE_SUPPORT) {
        Char = reg("[", chars(Char), "\\u{10000}-\\u{10FFFF}", "]");
      }
      var _SChar = /[\x20\x09\x0D\x0A]/;
      var SChar_s = chars(_SChar);
      var S = reg(_SChar, "+");
      var S_OPT = reg(_SChar, "*");
      var NameStartChar = /[:_a-zA-Z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      if (UNICODE_SUPPORT) {
        NameStartChar = reg("[", chars(NameStartChar), "\\u{10000}-\\u{10FFFF}", "]");
      }
      var NameStartChar_s = chars(NameStartChar);
      var NameChar = reg("[", NameStartChar_s, chars(/[-.0-9\xB7]/), chars(/[\u0300-\u036F\u203F-\u2040]/), "]");
      var Name = reg(NameStartChar, NameChar, "*");
      var Nmtoken = reg(NameChar, "+");
      var EntityRef = reg("&", Name, ";");
      var CharRef = regg(/&#[0-9]+;|&#x[0-9a-fA-F]+;/);
      var Reference = regg(EntityRef, "|", CharRef);
      var PEReference = reg("%", Name, ";");
      var EntityValue = regg(
        reg('"', regg(/[^%&"]/, "|", PEReference, "|", Reference), "*", '"'),
        "|",
        reg("'", regg(/[^%&']/, "|", PEReference, "|", Reference), "*", "'")
      );
      var AttValue = regg('"', regg(/[^<&"]/, "|", Reference), "*", '"', "|", "'", regg(/[^<&']/, "|", Reference), "*", "'");
      var NCNameStartChar = chars_without(NameStartChar, ":");
      var NCNameChar = chars_without(NameChar, ":");
      var NCName = reg(NCNameStartChar, NCNameChar, "*");
      var QName = reg(NCName, regg(":", NCName), "?");
      var QName_exact = reg("^", QName, "$");
      var QName_group = reg("(", QName, ")");
      var SystemLiteral = regg(/"[^"]*"|'[^']*'/);
      var PI = reg(/^<\?/, "(", Name, ")", regg(S, "(", Char, "*?)"), "?", /\?>/);
      var PubidChar = /[\x20\x0D\x0Aa-zA-Z0-9-'()+,./:=?;!*#@$_%]/;
      var PubidLiteral = regg('"', PubidChar, '*"', "|", "'", chars_without(PubidChar, "'"), "*'");
      var COMMENT_START = "<!--";
      var COMMENT_END = "-->";
      var Comment = reg(COMMENT_START, regg(chars_without(Char, "-"), "|", reg("-", chars_without(Char, "-"))), "*", COMMENT_END);
      var PCDATA = "#PCDATA";
      var Mixed = regg(
        reg(/\(/, S_OPT, PCDATA, regg(S_OPT, /\|/, S_OPT, QName), "*", S_OPT, /\)\*/),
        "|",
        reg(/\(/, S_OPT, PCDATA, S_OPT, /\)/)
      );
      var _children_quantity = /[?*+]?/;
      var children = reg(
        /\([^>]+\)/,
        _children_quantity
        /*regg(choice, '|', seq), _children_quantity*/
      );
      var contentspec = regg("EMPTY", "|", "ANY", "|", Mixed, "|", children);
      var ELEMENTDECL_START = "<!ELEMENT";
      var elementdecl = reg(ELEMENTDECL_START, S, regg(QName, "|", PEReference), S, regg(contentspec, "|", PEReference), S_OPT, ">");
      var NotationType = reg("NOTATION", S, /\(/, S_OPT, Name, regg(S_OPT, /\|/, S_OPT, Name), "*", S_OPT, /\)/);
      var Enumeration = reg(/\(/, S_OPT, Nmtoken, regg(S_OPT, /\|/, S_OPT, Nmtoken), "*", S_OPT, /\)/);
      var EnumeratedType = regg(NotationType, "|", Enumeration);
      var AttType = regg(/CDATA|ID|IDREF|IDREFS|ENTITY|ENTITIES|NMTOKEN|NMTOKENS/, "|", EnumeratedType);
      var DefaultDecl = regg(/#REQUIRED|#IMPLIED/, "|", regg(regg("#FIXED", S), "?", AttValue));
      var AttDef = regg(S, Name, S, AttType, S, DefaultDecl);
      var ATTLIST_DECL_START = "<!ATTLIST";
      var AttlistDecl = reg(ATTLIST_DECL_START, S, Name, AttDef, "*", S_OPT, ">");
      var ABOUT_LEGACY_COMPAT = "about:legacy-compat";
      var ABOUT_LEGACY_COMPAT_SystemLiteral = regg('"' + ABOUT_LEGACY_COMPAT + '"', "|", "'" + ABOUT_LEGACY_COMPAT + "'");
      var SYSTEM = "SYSTEM";
      var PUBLIC = "PUBLIC";
      var ExternalID = regg(regg(SYSTEM, S, SystemLiteral), "|", regg(PUBLIC, S, PubidLiteral, S, SystemLiteral));
      var ExternalID_match = reg(
        "^",
        regg(
          regg(SYSTEM, S, "(?<SystemLiteralOnly>", SystemLiteral, ")"),
          "|",
          regg(PUBLIC, S, "(?<PubidLiteral>", PubidLiteral, ")", S, "(?<SystemLiteral>", SystemLiteral, ")")
        )
      );
      var NDataDecl = regg(S, "NDATA", S, Name);
      var EntityDef = regg(EntityValue, "|", regg(ExternalID, NDataDecl, "?"));
      var ENTITY_DECL_START = "<!ENTITY";
      var GEDecl = reg(ENTITY_DECL_START, S, Name, S, EntityDef, S_OPT, ">");
      var PEDef = regg(EntityValue, "|", ExternalID);
      var PEDecl = reg(ENTITY_DECL_START, S, "%", S, Name, S, PEDef, S_OPT, ">");
      var EntityDecl = regg(GEDecl, "|", PEDecl);
      var PublicID = reg(PUBLIC, S, PubidLiteral);
      var NotationDecl = reg("<!NOTATION", S, Name, S, regg(ExternalID, "|", PublicID), S_OPT, ">");
      var Eq = reg(S_OPT, "=", S_OPT);
      var VersionNum = /1[.]\d+/;
      var VersionInfo = reg(S, "version", Eq, regg("'", VersionNum, "'", "|", '"', VersionNum, '"'));
      var EncName = /[A-Za-z][-A-Za-z0-9._]*/;
      var EncodingDecl = regg(S, "encoding", Eq, regg('"', EncName, '"', "|", "'", EncName, "'"));
      var SDDecl = regg(S, "standalone", Eq, regg("'", regg("yes", "|", "no"), "'", "|", '"', regg("yes", "|", "no"), '"'));
      var XMLDecl = reg(/^<\?xml/, VersionInfo, EncodingDecl, "?", SDDecl, "?", S_OPT, /\?>/);
      var DOCTYPE_DECL_START = "<!DOCTYPE";
      var CDATA_START = "<![CDATA[";
      var CDATA_END = "]]>";
      var CDStart = /<!\[CDATA\[/;
      var CDEnd = /\]\]>/;
      var CData = reg(Char, "*?", CDEnd);
      var CDSect = reg(CDStart, CData);
      exports2.chars = chars;
      exports2.chars_without = chars_without;
      exports2.detectUnicodeSupport = detectUnicodeSupport;
      exports2.reg = reg;
      exports2.regg = regg;
      exports2.ABOUT_LEGACY_COMPAT = ABOUT_LEGACY_COMPAT;
      exports2.ABOUT_LEGACY_COMPAT_SystemLiteral = ABOUT_LEGACY_COMPAT_SystemLiteral;
      exports2.AttlistDecl = AttlistDecl;
      exports2.CDATA_START = CDATA_START;
      exports2.CDATA_END = CDATA_END;
      exports2.CDSect = CDSect;
      exports2.Char = Char;
      exports2.Comment = Comment;
      exports2.COMMENT_START = COMMENT_START;
      exports2.COMMENT_END = COMMENT_END;
      exports2.DOCTYPE_DECL_START = DOCTYPE_DECL_START;
      exports2.elementdecl = elementdecl;
      exports2.EntityDecl = EntityDecl;
      exports2.EntityValue = EntityValue;
      exports2.ExternalID = ExternalID;
      exports2.ExternalID_match = ExternalID_match;
      exports2.Name = Name;
      exports2.NotationDecl = NotationDecl;
      exports2.Reference = Reference;
      exports2.PEReference = PEReference;
      exports2.PI = PI;
      exports2.PUBLIC = PUBLIC;
      exports2.PubidLiteral = PubidLiteral;
      exports2.QName = QName;
      exports2.QName_exact = QName_exact;
      exports2.QName_group = QName_group;
      exports2.S = S;
      exports2.SChar_s = SChar_s;
      exports2.S_OPT = S_OPT;
      exports2.SYSTEM = SYSTEM;
      exports2.SystemLiteral = SystemLiteral;
      exports2.UNICODE_REPLACEMENT_CHARACTER = UNICODE_REPLACEMENT_CHARACTER;
      exports2.UNICODE_SUPPORT = UNICODE_SUPPORT;
      exports2.XMLDecl = XMLDecl;
    }
  });

  // node_modules/@xmldom/xmldom/lib/dom.js
  var require_dom = __commonJS({
    "node_modules/@xmldom/xmldom/lib/dom.js"(exports2) {
      "use strict";
      var conventions = require_conventions();
      var find = conventions.find;
      var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
      var hasOwn = conventions.hasOwn;
      var isHTMLMimeType = conventions.isHTMLMimeType;
      var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
      var isHTMLVoidElement = conventions.isHTMLVoidElement;
      var MIME_TYPE = conventions.MIME_TYPE;
      var NAMESPACE = conventions.NAMESPACE;
      var PDC = Symbol();
      var errors = require_errors();
      var DOMException = errors.DOMException;
      var DOMExceptionName = errors.DOMExceptionName;
      var g = require_grammar();
      function checkSymbol(symbol) {
        if (symbol !== PDC) {
          throw new TypeError("Illegal constructor");
        }
      }
      function notEmptyString(input) {
        return input !== "";
      }
      function splitOnASCIIWhitespace(input) {
        return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
      }
      function orderedSetReducer(current, element) {
        if (!hasOwn(current, element)) {
          current[element] = true;
        }
        return current;
      }
      function toOrderedSet(input) {
        if (!input) return [];
        var list = splitOnASCIIWhitespace(input);
        return Object.keys(list.reduce(orderedSetReducer, {}));
      }
      function arrayIncludes(list) {
        return function(element) {
          return list && list.indexOf(element) !== -1;
        };
      }
      function validateQualifiedName(qualifiedName) {
        if (!g.QName_exact.test(qualifiedName)) {
          throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in qualified name "' + qualifiedName + '"');
        }
      }
      function validateAndExtract(namespace, qualifiedName) {
        validateQualifiedName(qualifiedName);
        namespace = namespace || null;
        var prefix = null;
        var localName = qualifiedName;
        if (qualifiedName.indexOf(":") >= 0) {
          var splitResult = qualifiedName.split(":");
          prefix = splitResult[0];
          localName = splitResult[1];
        }
        if (prefix !== null && namespace === null) {
          throw new DOMException(DOMException.NAMESPACE_ERR, "prefix is non-null and namespace is null");
        }
        if (prefix === "xml" && namespace !== conventions.NAMESPACE.XML) {
          throw new DOMException(DOMException.NAMESPACE_ERR, 'prefix is "xml" and namespace is not the XML namespace');
        }
        if ((prefix === "xmlns" || qualifiedName === "xmlns") && namespace !== conventions.NAMESPACE.XMLNS) {
          throw new DOMException(
            DOMException.NAMESPACE_ERR,
            'either qualifiedName or prefix is "xmlns" and namespace is not the XMLNS namespace'
          );
        }
        if (namespace === conventions.NAMESPACE.XMLNS && prefix !== "xmlns" && qualifiedName !== "xmlns") {
          throw new DOMException(
            DOMException.NAMESPACE_ERR,
            'namespace is the XMLNS namespace and neither qualifiedName nor prefix is "xmlns"'
          );
        }
        return [namespace, prefix, localName];
      }
      function copy(src, dest) {
        for (var p in src) {
          if (hasOwn(src, p)) {
            dest[p] = src[p];
          }
        }
      }
      function _extends(Class, Super) {
        var pt = Class.prototype;
        if (!(pt instanceof Super)) {
          let t = function() {
          };
          t.prototype = Super.prototype;
          t = new t();
          copy(pt, t);
          Class.prototype = pt = t;
        }
        if (pt.constructor != Class) {
          if (typeof Class != "function") {
            console.error("unknown Class:" + Class);
          }
          pt.constructor = Class;
        }
      }
      var NodeType = {};
      var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
      var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
      var TEXT_NODE = NodeType.TEXT_NODE = 3;
      var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
      var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
      var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
      var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
      var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
      var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
      var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
      var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
      var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
      var DocumentPosition = conventions.freeze({
        DOCUMENT_POSITION_DISCONNECTED: 1,
        DOCUMENT_POSITION_PRECEDING: 2,
        DOCUMENT_POSITION_FOLLOWING: 4,
        DOCUMENT_POSITION_CONTAINS: 8,
        DOCUMENT_POSITION_CONTAINED_BY: 16,
        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
      });
      function commonAncestor(a, b) {
        if (b.length < a.length) return commonAncestor(b, a);
        var c = null;
        for (var n in a) {
          if (a[n] !== b[n]) return c;
          c = a[n];
        }
        return c;
      }
      function docGUID(doc) {
        if (!doc.guid) doc.guid = Math.random();
        return doc.guid;
      }
      function NodeList() {
      }
      NodeList.prototype = {
        /**
         * The number of nodes in the list. The range of valid child node indices is 0 to length-1
         * inclusive.
         *
         * @type {number}
         */
        length: 0,
        /**
         * Returns the item at `index`. If index is greater than or equal to the number of nodes in
         * the list, this returns null.
         *
         * @param index
         * Unsigned long Index into the collection.
         * @returns {Node | null}
         * The node at position `index` in the NodeList,
         * or null if that is not a valid index.
         */
        item: function(index) {
          return index >= 0 && index < this.length ? this[index] : null;
        },
        /**
         * Returns a string representation of the NodeList.
         *
         * @param {unknown} nodeFilter
         * __A filter function? Not implemented according to the spec?__.
         * @returns {string}
         * A string representation of the NodeList.
         */
        toString: function(nodeFilter) {
          for (var buf = [], i = 0; i < this.length; i++) {
            serializeToString(this[i], buf, nodeFilter);
          }
          return buf.join("");
        },
        /**
         * Filters the NodeList based on a predicate.
         *
         * @param {function(Node): boolean} predicate
         * - A predicate function to filter the NodeList.
         * @returns {Node[]}
         * An array of nodes that satisfy the predicate.
         * @private
         */
        filter: function(predicate) {
          return Array.prototype.filter.call(this, predicate);
        },
        /**
         * Returns the first index at which a given node can be found in the NodeList, or -1 if it is
         * not present.
         *
         * @param {Node} item
         * - The Node item to locate in the NodeList.
         * @returns {number}
         * The first index of the node in the NodeList; -1 if not found.
         * @private
         */
        indexOf: function(item) {
          return Array.prototype.indexOf.call(this, item);
        }
      };
      NodeList.prototype[Symbol.iterator] = function() {
        var me = this;
        var index = 0;
        return {
          next: function() {
            if (index < me.length) {
              return {
                value: me[index++],
                done: false
              };
            } else {
              return {
                done: true
              };
            }
          },
          return: function() {
            return {
              done: true
            };
          }
        };
      };
      function LiveNodeList(node, refresh) {
        this._node = node;
        this._refresh = refresh;
        _updateLiveList(this);
      }
      function _updateLiveList(list) {
        var inc = list._node._inc || list._node.ownerDocument._inc;
        if (list._inc !== inc) {
          var ls = list._refresh(list._node);
          __set__(list, "length", ls.length);
          if (!list.$$length || ls.length < list.$$length) {
            for (var i = ls.length; i in list; i++) {
              if (hasOwn(list, i)) {
                delete list[i];
              }
            }
          }
          copy(ls, list);
          list._inc = inc;
        }
      }
      LiveNodeList.prototype.item = function(i) {
        _updateLiveList(this);
        return this[i] || null;
      };
      _extends(LiveNodeList, NodeList);
      function NamedNodeMap() {
      }
      function _findNodeIndex(list, node) {
        var i = 0;
        while (i < list.length) {
          if (list[i] === node) {
            return i;
          }
          i++;
        }
      }
      function _addNamedNode(el, list, newAttr, oldAttr) {
        if (oldAttr) {
          list[_findNodeIndex(list, oldAttr)] = newAttr;
        } else {
          list[list.length] = newAttr;
          list.length++;
        }
        if (el) {
          newAttr.ownerElement = el;
          var doc = el.ownerDocument;
          if (doc) {
            oldAttr && _onRemoveAttribute(doc, el, oldAttr);
            _onAddAttribute(doc, el, newAttr);
          }
        }
      }
      function _removeNamedNode(el, list, attr) {
        var i = _findNodeIndex(list, attr);
        if (i >= 0) {
          var lastIndex = list.length - 1;
          while (i <= lastIndex) {
            list[i] = list[++i];
          }
          list.length = lastIndex;
          if (el) {
            var doc = el.ownerDocument;
            if (doc) {
              _onRemoveAttribute(doc, el, attr);
            }
            attr.ownerElement = null;
          }
        }
      }
      NamedNodeMap.prototype = {
        length: 0,
        item: NodeList.prototype.item,
        /**
         * Get an attribute by name. Note: Name is in lower case in case of HTML namespace and
         * document.
         *
         * @param {string} localName
         * The local name of the attribute.
         * @returns {Attr | null}
         * The attribute with the given local name, or null if no such attribute exists.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-name
         */
        getNamedItem: function(localName) {
          if (this._ownerElement && this._ownerElement._isInHTMLDocumentAndNamespace()) {
            localName = localName.toLowerCase();
          }
          var i = 0;
          while (i < this.length) {
            var attr = this[i];
            if (attr.nodeName === localName) {
              return attr;
            }
            i++;
          }
          return null;
        },
        /**
         * Set an attribute.
         *
         * @param {Attr} attr
         * The attribute to set.
         * @returns {Attr | null}
         * The old attribute with the same local name and namespace URI as the new one, or null if no
         * such attribute exists.
         * @throws {DOMException}
         * With code:
         * - {@link INUSE_ATTRIBUTE_ERR} - If the attribute is already an attribute of another
         * element.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
         */
        setNamedItem: function(attr) {
          var el = attr.ownerElement;
          if (el && el !== this._ownerElement) {
            throw new DOMException(DOMException.INUSE_ATTRIBUTE_ERR);
          }
          var oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
          if (oldAttr === attr) {
            return attr;
          }
          _addNamedNode(this._ownerElement, this, attr, oldAttr);
          return oldAttr;
        },
        /**
         * Set an attribute, replacing an existing attribute with the same local name and namespace
         * URI if one exists.
         *
         * @param {Attr} attr
         * The attribute to set.
         * @returns {Attr | null}
         * The old attribute with the same local name and namespace URI as the new one, or null if no
         * such attribute exists.
         * @throws {DOMException}
         * Throws a DOMException with the name "InUseAttributeError" if the attribute is already an
         * attribute of another element.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
         */
        setNamedItemNS: function(attr) {
          return this.setNamedItem(attr);
        },
        /**
         * Removes an attribute specified by the local name.
         *
         * @param {string} localName
         * The local name of the attribute to be removed.
         * @returns {Attr}
         * The attribute node that was removed.
         * @throws {DOMException}
         * With code:
         * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given name is found.
         * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditem
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-name
         */
        removeNamedItem: function(localName) {
          var attr = this.getNamedItem(localName);
          if (!attr) {
            throw new DOMException(DOMException.NOT_FOUND_ERR, localName);
          }
          _removeNamedNode(this._ownerElement, this, attr);
          return attr;
        },
        /**
         * Removes an attribute specified by the namespace and local name.
         *
         * @param {string | null} namespaceURI
         * The namespace URI of the attribute to be removed.
         * @param {string} localName
         * The local name of the attribute to be removed.
         * @returns {Attr}
         * The attribute node that was removed.
         * @throws {DOMException}
         * With code:
         * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given namespace URI and local
         * name is found.
         * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditemns
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-namespace
         */
        removeNamedItemNS: function(namespaceURI, localName) {
          var attr = this.getNamedItemNS(namespaceURI, localName);
          if (!attr) {
            throw new DOMException(DOMException.NOT_FOUND_ERR, namespaceURI ? namespaceURI + " : " + localName : localName);
          }
          _removeNamedNode(this._ownerElement, this, attr);
          return attr;
        },
        /**
         * Get an attribute by namespace and local name.
         *
         * @param {string | null} namespaceURI
         * The namespace URI of the attribute.
         * @param {string} localName
         * The local name of the attribute.
         * @returns {Attr | null}
         * The attribute with the given namespace URI and local name, or null if no such attribute
         * exists.
         * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-namespace
         */
        getNamedItemNS: function(namespaceURI, localName) {
          if (!namespaceURI) {
            namespaceURI = null;
          }
          var i = 0;
          while (i < this.length) {
            var node = this[i];
            if (node.localName === localName && node.namespaceURI === namespaceURI) {
              return node;
            }
            i++;
          }
          return null;
        }
      };
      NamedNodeMap.prototype[Symbol.iterator] = function() {
        var me = this;
        var index = 0;
        return {
          next: function() {
            if (index < me.length) {
              return {
                value: me[index++],
                done: false
              };
            } else {
              return {
                done: true
              };
            }
          },
          return: function() {
            return {
              done: true
            };
          }
        };
      };
      function DOMImplementation() {
      }
      DOMImplementation.prototype = {
        /**
         * Test if the DOM implementation implements a specific feature and version, as specified in
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/core.html#DOMFeatures DOM Features}.
         *
         * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given
         * feature is supported. The different implementations fairly diverged in what kind of
         * features were reported. The latest version of the spec settled to force this method to
         * always return true, where the functionality was accurate and in use.
         *
         * @deprecated
         * It is deprecated and modern browsers return true in all cases.
         * @function DOMImplementation#hasFeature
         * @param {string} feature
         * The name of the feature to test.
         * @param {string} [version]
         * This is the version number of the feature to test.
         * @returns {boolean}
         * Always returns true.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
         * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-5CED94D7 DOM Level 3 Core
         */
        hasFeature: function(feature, version) {
          return true;
        },
        /**
         * Creates a DOM Document object of the specified type with its document element. Note that
         * based on the {@link DocumentType}
         * given to create the document, the implementation may instantiate specialized
         * {@link Document} objects that support additional features than the "Core", such as "HTML"
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML}.
         * On the other hand, setting the {@link DocumentType} after the document was created makes
         * this very unlikely to happen. Alternatively, specialized {@link Document} creation methods,
         * such as createHTMLDocument
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML},
         * can be used to obtain specific types of {@link Document} objects.
         *
         * __It behaves slightly different from the description in the living standard__:
         * - There is no interface/class `XMLDocument`, it returns a `Document`
         * instance (with it's `type` set to `'xml'`).
         * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
         *
         * @function DOMImplementation.createDocument
         * @param {string | null} namespaceURI
         * The
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-namespaceURI namespace URI}
         * of the document element to create or null.
         * @param {string | null} qualifiedName
         * The
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified name}
         * of the document element to be created or null.
         * @param {DocumentType | null} [doctype=null]
         * The type of document to be created or null. When doctype is not null, its
         * {@link Node#ownerDocument} attribute is set to the document being created. Default is
         * `null`
         * @returns {Document}
         * A new {@link Document} object with its document element. If the NamespaceURI,
         * qualifiedName, and doctype are null, the returned {@link Document} is empty with no
         * document element.
         * @throws {DOMException}
         * With code:
         *
         * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
         * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
         * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed, if the qualifiedName has a
         * prefix and the namespaceURI is null, or if the qualifiedName is null and the namespaceURI
         * is different from null, or if the qualifiedName has a prefix that is "xml" and the
         * namespaceURI is different from "{@link http://www.w3.org/XML/1998/namespace}"
         * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#Namespaces XML Namespaces},
         * or if the DOM implementation does not support the "XML" feature but a non-null namespace
         * URI was provided, since namespaces were defined by XML.
         * - `WRONG_DOCUMENT_ERR`: Raised if doctype has already been used with a different document
         * or was created from a different implementation.
         * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
         * "XML" and the language exposed through the Document does not support XML Namespaces (such
         * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
         * @since DOM Level 2.
         * @see {@link #createHTMLDocument}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument DOM Living Standard
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-2-Core-DOM-createDocument DOM
         *      Level 3 Core
         * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM
         *      Level 2 Core (initial)
         */
        createDocument: function(namespaceURI, qualifiedName, doctype) {
          var contentType = MIME_TYPE.XML_APPLICATION;
          if (namespaceURI === NAMESPACE.HTML) {
            contentType = MIME_TYPE.XML_XHTML_APPLICATION;
          } else if (namespaceURI === NAMESPACE.SVG) {
            contentType = MIME_TYPE.XML_SVG_IMAGE;
          }
          var doc = new Document(PDC, { contentType });
          doc.implementation = this;
          doc.childNodes = new NodeList();
          doc.doctype = doctype || null;
          if (doctype) {
            doc.appendChild(doctype);
          }
          if (qualifiedName) {
            var root = doc.createElementNS(namespaceURI, qualifiedName);
            doc.appendChild(root);
          }
          return doc;
        },
        /**
         * Creates an empty DocumentType node. Entity declarations and notations are not made
         * available. Entity reference expansions and default attribute additions do not occur.
         *
         * **This behavior is slightly different from the one in the specs**:
         * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
         * - `publicId` and `systemId` contain the raw data including any possible quotes,
         *   so they can always be serialized back to the original value
         * - `internalSubset` contains the raw string between `[` and `]` if present,
         *   but is not parsed or validated in any form.
         *
         * @function DOMImplementation#createDocumentType
         * @param {string} qualifiedName
         * The {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified
         * name} of the document type to be created.
         * @param {string} [publicId]
         * The external subset public identifier.
         * @param {string} [systemId]
         * The external subset system identifier.
         * @param {string} [internalSubset]
         * the internal subset or an empty string if it is not present
         * @returns {DocumentType}
         * A new {@link DocumentType} node with {@link Node#ownerDocument} set to null.
         * @throws {DOMException}
         * With code:
         *
         * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
         * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
         * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed.
         * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
         * "XML" and the language exposed through the Document does not support XML Namespaces (such
         * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
         * @since DOM Level 2.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType
         *      MDN
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living
         *      Standard
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-3-Core-DOM-createDocType DOM
         *      Level 3 Core
         * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM
         *      Level 2 Core
         * @see https://github.com/xmldom/xmldom/blob/master/CHANGELOG.md#050
         * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-Core-DocType-internalSubset
         * @prettierignore
         */
        createDocumentType: function(qualifiedName, publicId, systemId, internalSubset) {
          validateQualifiedName(qualifiedName);
          var node = new DocumentType(PDC);
          node.name = qualifiedName;
          node.nodeName = qualifiedName;
          node.publicId = publicId || "";
          node.systemId = systemId || "";
          node.internalSubset = internalSubset || "";
          node.childNodes = new NodeList();
          return node;
        },
        /**
         * Returns an HTML document, that might already have a basic DOM structure.
         *
         * __It behaves slightly different from the description in the living standard__:
         * - If the first argument is `false` no initial nodes are added (steps 3-7 in the specs are
         * omitted)
         * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
         *
         * @param {string | false} [title]
         * A string containing the title to give the new HTML document.
         * @returns {Document}
         * The HTML document.
         * @since WHATWG Living Standard.
         * @see {@link #createDocument}
         * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
         * @see https://dom.spec.whatwg.org/#html-document
         */
        createHTMLDocument: function(title) {
          var doc = new Document(PDC, { contentType: MIME_TYPE.HTML });
          doc.implementation = this;
          doc.childNodes = new NodeList();
          if (title !== false) {
            doc.doctype = this.createDocumentType("html");
            doc.doctype.ownerDocument = doc;
            doc.appendChild(doc.doctype);
            var htmlNode = doc.createElement("html");
            doc.appendChild(htmlNode);
            var headNode = doc.createElement("head");
            htmlNode.appendChild(headNode);
            if (typeof title === "string") {
              var titleNode = doc.createElement("title");
              titleNode.appendChild(doc.createTextNode(title));
              headNode.appendChild(titleNode);
            }
            htmlNode.appendChild(doc.createElement("body"));
          }
          return doc;
        }
      };
      function Node(symbol) {
        checkSymbol(symbol);
      }
      Node.prototype = {
        /**
         * The first child of this node.
         *
         * @type {Node | null}
         */
        firstChild: null,
        /**
         * The last child of this node.
         *
         * @type {Node | null}
         */
        lastChild: null,
        /**
         * The previous sibling of this node.
         *
         * @type {Node | null}
         */
        previousSibling: null,
        /**
         * The next sibling of this node.
         *
         * @type {Node | null}
         */
        nextSibling: null,
        /**
         * The parent node of this node.
         *
         * @type {Node | null}
         */
        parentNode: null,
        /**
         * The parent element of this node.
         *
         * @type {Element | null}
         */
        get parentElement() {
          return this.parentNode && this.parentNode.nodeType === this.ELEMENT_NODE ? this.parentNode : null;
        },
        /**
         * The child nodes of this node.
         *
         * @type {NodeList}
         */
        childNodes: null,
        /**
         * The document object associated with this node.
         *
         * @type {Document | null}
         */
        ownerDocument: null,
        /**
         * The value of this node.
         *
         * @type {string | null}
         */
        nodeValue: null,
        /**
         * The namespace URI of this node.
         *
         * @type {string | null}
         */
        namespaceURI: null,
        /**
         * The prefix of the namespace for this node.
         *
         * @type {string | null}
         */
        prefix: null,
        /**
         * The local part of the qualified name of this node.
         *
         * @type {string | null}
         */
        localName: null,
        /**
         * The baseURI is currently always `about:blank`,
         * since that's what happens when you create a document from scratch.
         *
         * @type {'about:blank'}
         */
        baseURI: "about:blank",
        /**
         * Is true if this node is part of a document.
         *
         * @type {boolean}
         */
        get isConnected() {
          var rootNode = this.getRootNode();
          return rootNode && rootNode.nodeType === rootNode.DOCUMENT_NODE;
        },
        /**
         * Checks whether `other` is an inclusive descendant of this node.
         *
         * @param {Node | null | undefined} other
         * The node to check.
         * @returns {boolean}
         * True if `other` is an inclusive descendant of this node; false otherwise.
         * @see https://dom.spec.whatwg.org/#dom-node-contains
         */
        contains: function(other) {
          if (!other) return false;
          var parent = other;
          do {
            if (this === parent) return true;
            parent = other.parentNode;
          } while (parent);
          return false;
        },
        /**
         * @typedef GetRootNodeOptions
         * @property {boolean} [composed=false]
         */
        /**
         * Searches for the root node of this node.
         *
         * **This behavior is slightly different from the in the specs**:
         * - ignores `options.composed`, since `ShadowRoot`s are unsupported, always returns root.
         *
         * @param {GetRootNodeOptions} [options]
         * @returns {Node}
         * Root node.
         * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
         * @see https://dom.spec.whatwg.org/#concept-shadow-including-root
         */
        getRootNode: function(options) {
          var parent = this;
          do {
            if (!parent.parentNode) {
              return parent;
            }
            parent = parent.parentNode;
          } while (parent);
        },
        /**
         * Checks whether the given node is equal to this node.
         *
         * @param {Node} [otherNode]
         * @see https://dom.spec.whatwg.org/#concept-node-equals
         */
        isEqualNode: function(otherNode) {
          if (!otherNode) return false;
          if (this.nodeType !== otherNode.nodeType) return false;
          switch (this.nodeType) {
            case this.DOCUMENT_TYPE_NODE:
              if (this.name !== otherNode.name) return false;
              if (this.publicId !== otherNode.publicId) return false;
              if (this.systemId !== otherNode.systemId) return false;
              break;
            case this.ELEMENT_NODE:
              if (this.namespaceURI !== otherNode.namespaceURI) return false;
              if (this.prefix !== otherNode.prefix) return false;
              if (this.localName !== otherNode.localName) return false;
              if (this.attributes.length !== otherNode.attributes.length) return false;
              for (var i = 0; i < this.attributes.length; i++) {
                var attr = this.attributes.item(i);
                if (!attr.isEqualNode(otherNode.getAttributeNodeNS(attr.namespaceURI, attr.localName))) {
                  return false;
                }
              }
              break;
            case this.ATTRIBUTE_NODE:
              if (this.namespaceURI !== otherNode.namespaceURI) return false;
              if (this.localName !== otherNode.localName) return false;
              if (this.value !== otherNode.value) return false;
              break;
            case this.PROCESSING_INSTRUCTION_NODE:
              if (this.target !== otherNode.target || this.data !== otherNode.data) {
                return false;
              }
              break;
            case this.TEXT_NODE:
            case this.COMMENT_NODE:
              if (this.data !== otherNode.data) return false;
              break;
          }
          if (this.childNodes.length !== otherNode.childNodes.length) {
            return false;
          }
          for (var i = 0; i < this.childNodes.length; i++) {
            if (!this.childNodes[i].isEqualNode(otherNode.childNodes[i])) {
              return false;
            }
          }
          return true;
        },
        /**
         * Checks whether or not the given node is this node.
         *
         * @param {Node} [otherNode]
         */
        isSameNode: function(otherNode) {
          return this === otherNode;
        },
        /**
         * Inserts a node before a reference node as a child of this node.
         *
         * @param {Node} newChild
         * The new child node to be inserted.
         * @param {Node | null} refChild
         * The reference node before which newChild will be inserted.
         * @returns {Node}
         * The new child node successfully inserted.
         * @throws {DOMException}
         * Throws a DOMException if inserting the node would result in a DOM tree that is not
         * well-formed, or if `child` is provided but is not a child of `parent`.
         * See {@link _insertBefore} for more details.
         * @since Modified in DOM L2
         */
        insertBefore: function(newChild, refChild) {
          return _insertBefore(this, newChild, refChild);
        },
        /**
         * Replaces an old child node with a new child node within this node.
         *
         * @param {Node} newChild
         * The new node that is to replace the old node.
         * If it already exists in the DOM, it is removed from its original position.
         * @param {Node} oldChild
         * The existing child node to be replaced.
         * @returns {Node}
         * Returns the replaced child node.
         * @throws {DOMException}
         * Throws a DOMException if replacing the node would result in a DOM tree that is not
         * well-formed, or if `oldChild` is not a child of `this`.
         * This can also occur if the pre-replacement validity assertion fails.
         * See {@link _insertBefore}, {@link Node.removeChild}, and
         * {@link assertPreReplacementValidityInDocument} for more details.
         * @see https://dom.spec.whatwg.org/#concept-node-replace
         */
        replaceChild: function(newChild, oldChild) {
          _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
          if (oldChild) {
            this.removeChild(oldChild);
          }
        },
        /**
         * Removes an existing child node from this node.
         *
         * @param {Node} oldChild
         * The child node to be removed.
         * @returns {Node}
         * Returns the removed child node.
         * @throws {DOMException}
         * Throws a DOMException if `oldChild` is not a child of `this`.
         * See {@link _removeChild} for more details.
         */
        removeChild: function(oldChild) {
          return _removeChild(this, oldChild);
        },
        /**
         * Appends a child node to this node.
         *
         * @param {Node} newChild
         * The child node to be appended to this node.
         * If it already exists in the DOM, it is removed from its original position.
         * @returns {Node}
         * Returns the appended child node.
         * @throws {DOMException}
         * Throws a DOMException if appending the node would result in a DOM tree that is not
         * well-formed, or if `newChild` is not a valid Node.
         * See {@link insertBefore} for more details.
         */
        appendChild: function(newChild) {
          return this.insertBefore(newChild, null);
        },
        /**
         * Determines whether this node has any child nodes.
         *
         * @returns {boolean}
         * Returns true if this node has any child nodes, and false otherwise.
         */
        hasChildNodes: function() {
          return this.firstChild != null;
        },
        /**
         * Creates a copy of the calling node.
         *
         * @param {boolean} deep
         * If true, the contents of the node are recursively copied.
         * If false, only the node itself (and its attributes, if it is an element) are copied.
         * @returns {Node}
         * Returns the newly created copy of the node.
         * @throws {DOMException}
         * May throw a DOMException if operations within {@link Element#setAttributeNode} or
         * {@link Node#appendChild} (which are potentially invoked in this method) do not meet their
         * specific constraints.
         * @see {@link cloneNode}
         */
        cloneNode: function(deep) {
          return cloneNode(this.ownerDocument || this, this, deep);
        },
        /**
         * Puts the specified node and all of its subtree into a "normalized" form. In a normalized
         * subtree, no text nodes in the subtree are empty and there are no adjacent text nodes.
         *
         * Specifically, this method merges any adjacent text nodes (i.e., nodes for which `nodeType`
         * is `TEXT_NODE`) into a single node with the combined data. It also removes any empty text
         * nodes.
         *
         * This method operates recursively, so it also normalizes any and all descendent nodes within
         * the subtree.
         *
         * @throws {DOMException}
         * May throw a DOMException if operations within removeChild or appendData (which are
         * potentially invoked in this method) do not meet their specific constraints.
         * @since Modified in DOM Level 2
         * @see {@link Node.removeChild}
         * @see {@link CharacterData.appendData}
         */
        normalize: function() {
          var child = this.firstChild;
          while (child) {
            var next = child.nextSibling;
            if (next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE) {
              this.removeChild(next);
              child.appendData(next.data);
            } else {
              child.normalize();
              child = next;
            }
          }
        },
        /**
         * Checks whether the DOM implementation implements a specific feature and its version.
         *
         * @deprecated
         * Since `DOMImplementation.hasFeature` is deprecated and always returns true.
         * @param {string} feature
         * The package name of the feature to test. This is the same name that can be passed to the
         * method `hasFeature` on `DOMImplementation`.
         * @param {string} version
         * This is the version number of the package name to test.
         * @returns {boolean}
         * Returns true in all cases in the current implementation.
         * @since Introduced in DOM Level 2
         * @see {@link DOMImplementation.hasFeature}
         */
        isSupported: function(feature, version) {
          return this.ownerDocument.implementation.hasFeature(feature, version);
        },
        /**
         * Look up the prefix associated to the given namespace URI, starting from this node.
         * **The default namespace declarations are ignored by this method.**
         * See Namespace Prefix Lookup for details on the algorithm used by this method.
         *
         * **This behavior is different from the in the specs**:
         * - no node type specific handling
         * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
         *
         * @param {string | null} namespaceURI
         * The namespace URI for which to find the associated prefix.
         * @returns {string | null}
         * The associated prefix, if found; otherwise, null.
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
         * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
         * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
         * @see https://github.com/xmldom/xmldom/issues/322
         * @prettierignore
         */
        lookupPrefix: function(namespaceURI) {
          var el = this;
          while (el) {
            var map = el._nsMap;
            if (map) {
              for (var n in map) {
                if (hasOwn(map, n) && map[n] === namespaceURI) {
                  return n;
                }
              }
            }
            el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
          }
          return null;
        },
        /**
         * This function is used to look up the namespace URI associated with the given prefix,
         * starting from this node.
         *
         * **This behavior is different from the in the specs**:
         * - no node type specific handling
         * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
         *
         * @param {string | null} prefix
         * The prefix for which to find the associated namespace URI.
         * @returns {string | null}
         * The associated namespace URI, if found; otherwise, null.
         * @since DOM Level 3
         * @see https://dom.spec.whatwg.org/#dom-node-lookupnamespaceuri
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespaceURI
         * @prettierignore
         */
        lookupNamespaceURI: function(prefix) {
          var el = this;
          while (el) {
            var map = el._nsMap;
            if (map) {
              if (hasOwn(map, prefix)) {
                return map[prefix];
              }
            }
            el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
          }
          return null;
        },
        /**
         * Determines whether the given namespace URI is the default namespace.
         *
         * The function works by looking up the prefix associated with the given namespace URI. If no
         * prefix is found (i.e., the namespace URI is not registered in the namespace map of this
         * node or any of its ancestors), it returns `true`, implying the namespace URI is considered
         * the default.
         *
         * **This behavior is different from the in the specs**:
         * - no node type specific handling
         * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
         *
         * @param {string | null} namespaceURI
         * The namespace URI to be checked.
         * @returns {boolean}
         * Returns true if the given namespace URI is the default namespace, false otherwise.
         * @since DOM Level 3
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isDefaultNamespace
         * @see https://dom.spec.whatwg.org/#dom-node-isdefaultnamespace
         * @prettierignore
         */
        isDefaultNamespace: function(namespaceURI) {
          var prefix = this.lookupPrefix(namespaceURI);
          return prefix == null;
        },
        /**
         * Compares the reference node with a node with regard to their position in the document and
         * according to the document order.
         *
         * @param {Node} other
         * The node to compare the reference node to.
         * @returns {number}
         * Returns how the node is positioned relatively to the reference node according to the
         * bitmask. 0 if reference node and given node are the same.
         * @since DOM Level 3
         * @see https://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/core.html#Node3-compare
         * @see https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
         */
        compareDocumentPosition: function(other) {
          if (this === other) return 0;
          var node1 = other;
          var node2 = this;
          var attr1 = null;
          var attr2 = null;
          if (node1 instanceof Attr) {
            attr1 = node1;
            node1 = attr1.ownerElement;
          }
          if (node2 instanceof Attr) {
            attr2 = node2;
            node2 = attr2.ownerElement;
            if (attr1 && node1 && node2 === node1) {
              for (var i = 0, attr; attr = node2.attributes[i]; i++) {
                if (attr === attr1)
                  return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
                if (attr === attr2)
                  return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
              }
            }
          }
          if (!node1 || !node2 || node2.ownerDocument !== node1.ownerDocument) {
            return DocumentPosition.DOCUMENT_POSITION_DISCONNECTED + DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + (docGUID(node2.ownerDocument) > docGUID(node1.ownerDocument) ? DocumentPosition.DOCUMENT_POSITION_FOLLOWING : DocumentPosition.DOCUMENT_POSITION_PRECEDING);
          }
          if (attr2 && node1 === node2) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          }
          if (attr1 && node1 === node2) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          }
          var chain1 = [];
          var ancestor1 = node1.parentNode;
          while (ancestor1) {
            if (!attr2 && ancestor1 === node2) {
              return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            }
            chain1.push(ancestor1);
            ancestor1 = ancestor1.parentNode;
          }
          chain1.reverse();
          var chain2 = [];
          var ancestor2 = node2.parentNode;
          while (ancestor2) {
            if (!attr1 && ancestor2 === node1) {
              return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
            }
            chain2.push(ancestor2);
            ancestor2 = ancestor2.parentNode;
          }
          chain2.reverse();
          var ca = commonAncestor(chain1, chain2);
          for (var n in ca.childNodes) {
            var child = ca.childNodes[n];
            if (child === node2) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            if (child === node1) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
            if (chain2.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            if (chain1.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          }
          return 0;
        }
      };
      function _xmlEncoder(c) {
        return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
      }
      copy(NodeType, Node);
      copy(NodeType, Node.prototype);
      copy(DocumentPosition, Node);
      copy(DocumentPosition, Node.prototype);
      function _visitNode(node, callback) {
        if (callback(node)) {
          return true;
        }
        if (node = node.firstChild) {
          do {
            if (_visitNode(node, callback)) {
              return true;
            }
          } while (node = node.nextSibling);
        }
      }
      function Document(symbol, options) {
        checkSymbol(symbol);
        var opt = options || {};
        this.ownerDocument = this;
        this.contentType = opt.contentType || MIME_TYPE.XML_APPLICATION;
        this.type = isHTMLMimeType(this.contentType) ? "html" : "xml";
      }
      function _onAddAttribute(doc, el, newAttr) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        if (ns === NAMESPACE.XMLNS) {
          el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
        }
      }
      function _onRemoveAttribute(doc, el, newAttr, remove) {
        doc && doc._inc++;
        var ns = newAttr.namespaceURI;
        if (ns === NAMESPACE.XMLNS) {
          delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
        }
      }
      function _onUpdateChild(doc, parent, newChild) {
        if (doc && doc._inc) {
          doc._inc++;
          var childNodes = parent.childNodes;
          if (newChild && !newChild.nextSibling) {
            childNodes[childNodes.length++] = newChild;
          } else {
            var child = parent.firstChild;
            var i = 0;
            while (child) {
              childNodes[i++] = child;
              child = child.nextSibling;
            }
            childNodes.length = i;
            delete childNodes[childNodes.length];
          }
        }
      }
      function _removeChild(parentNode, child) {
        if (parentNode !== child.parentNode) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, "child's parent is not parent");
        }
        var oldPreviousSibling = child.previousSibling;
        var oldNextSibling = child.nextSibling;
        if (oldPreviousSibling) {
          oldPreviousSibling.nextSibling = oldNextSibling;
        } else {
          parentNode.firstChild = oldNextSibling;
        }
        if (oldNextSibling) {
          oldNextSibling.previousSibling = oldPreviousSibling;
        } else {
          parentNode.lastChild = oldPreviousSibling;
        }
        _onUpdateChild(parentNode.ownerDocument, parentNode);
        child.parentNode = null;
        child.previousSibling = null;
        child.nextSibling = null;
        return child;
      }
      function hasValidParentNodeType(node) {
        return node && (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.ELEMENT_NODE);
      }
      function hasInsertableNodeType(node) {
        return node && (node.nodeType === Node.CDATA_SECTION_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.DOCUMENT_TYPE_NODE || node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE || node.nodeType === Node.TEXT_NODE);
      }
      function isDocTypeNode(node) {
        return node && node.nodeType === Node.DOCUMENT_TYPE_NODE;
      }
      function isElementNode(node) {
        return node && node.nodeType === Node.ELEMENT_NODE;
      }
      function isTextNode(node) {
        return node && node.nodeType === Node.TEXT_NODE;
      }
      function isElementInsertionPossible(doc, child) {
        var parentChildNodes = doc.childNodes || [];
        if (find(parentChildNodes, isElementNode) || isDocTypeNode(child)) {
          return false;
        }
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function isElementReplacementPossible(doc, child) {
        var parentChildNodes = doc.childNodes || [];
        function hasElementChildThatIsNotChild(node) {
          return isElementNode(node) && node !== child;
        }
        if (find(parentChildNodes, hasElementChildThatIsNotChild)) {
          return false;
        }
        var docTypeNode = find(parentChildNodes, isDocTypeNode);
        return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
      }
      function assertPreInsertionValidity1to5(parent, node, child) {
        if (!hasValidParentNodeType(parent)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
        }
        if (child && child.parentNode !== parent) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, "child not in parent");
        }
        if (
          // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
          !hasInsertableNodeType(node) || // 5. If either `node` is a Text node and `parent` is a document,
          // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
          // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
          // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
          isDocTypeNode(node) && parent.nodeType !== Node.DOCUMENT_NODE
        ) {
          throw new DOMException(
            DOMException.HIERARCHY_REQUEST_ERR,
            "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType
          );
        }
      }
      function assertPreInsertionValidityInDocument(parent, node, child) {
        var parentChildNodes = parent.childNodes || [];
        var nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          }
          if (nodeChildElements.length === 1 && !isElementInsertionPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
          }
        }
        if (isElementNode(node)) {
          if (!isElementInsertionPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
          }
        }
        if (isDocTypeNode(node)) {
          if (find(parentChildNodes, isDocTypeNode)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          }
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
          }
          if (!child && parentElementChild) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
          }
        }
      }
      function assertPreReplacementValidityInDocument(parent, node, child) {
        var parentChildNodes = parent.childNodes || [];
        var nodeChildNodes = node.childNodes || [];
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var nodeChildElements = nodeChildNodes.filter(isElementNode);
          if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
          }
          if (nodeChildElements.length === 1 && !isElementReplacementPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
          }
        }
        if (isElementNode(node)) {
          if (!isElementReplacementPossible(parent, child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
          }
        }
        if (isDocTypeNode(node)) {
          let hasDoctypeChildThatIsNotChild = function(node2) {
            return isDocTypeNode(node2) && node2 !== child;
          };
          if (find(parentChildNodes, hasDoctypeChildThatIsNotChild)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
          }
          var parentElementChild = find(parentChildNodes, isElementNode);
          if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
            throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
          }
        }
      }
      function _insertBefore(parent, node, child, _inDocumentAssertion) {
        assertPreInsertionValidity1to5(parent, node, child);
        if (parent.nodeType === Node.DOCUMENT_NODE) {
          (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
        }
        var cp = node.parentNode;
        if (cp) {
          cp.removeChild(node);
        }
        if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
          var newFirst = node.firstChild;
          if (newFirst == null) {
            return node;
          }
          var newLast = node.lastChild;
        } else {
          newFirst = newLast = node;
        }
        var pre = child ? child.previousSibling : parent.lastChild;
        newFirst.previousSibling = pre;
        newLast.nextSibling = child;
        if (pre) {
          pre.nextSibling = newFirst;
        } else {
          parent.firstChild = newFirst;
        }
        if (child == null) {
          parent.lastChild = newLast;
        } else {
          child.previousSibling = newLast;
        }
        do {
          newFirst.parentNode = parent;
        } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
        _onUpdateChild(parent.ownerDocument || parent, parent, node);
        if (node.nodeType == DOCUMENT_FRAGMENT_NODE) {
          node.firstChild = node.lastChild = null;
        }
        return node;
      }
      Document.prototype = {
        /**
         * The implementation that created this document.
         *
         * @type DOMImplementation
         * @readonly
         */
        implementation: null,
        nodeName: "#document",
        nodeType: DOCUMENT_NODE,
        /**
         * The DocumentType node of the document.
         *
         * @type DocumentType
         * @readonly
         */
        doctype: null,
        documentElement: null,
        _inc: 1,
        insertBefore: function(newChild, refChild) {
          if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
            var child = newChild.firstChild;
            while (child) {
              var next = child.nextSibling;
              this.insertBefore(child, refChild);
              child = next;
            }
            return newChild;
          }
          _insertBefore(this, newChild, refChild);
          newChild.ownerDocument = this;
          if (this.documentElement === null && newChild.nodeType === ELEMENT_NODE) {
            this.documentElement = newChild;
          }
          return newChild;
        },
        removeChild: function(oldChild) {
          var removed = _removeChild(this, oldChild);
          if (removed === this.documentElement) {
            this.documentElement = null;
          }
          return removed;
        },
        replaceChild: function(newChild, oldChild) {
          _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
          newChild.ownerDocument = this;
          if (oldChild) {
            this.removeChild(oldChild);
          }
          if (isElementNode(newChild)) {
            this.documentElement = newChild;
          }
        },
        // Introduced in DOM Level 2:
        importNode: function(importedNode, deep) {
          return importNode(this, importedNode, deep);
        },
        // Introduced in DOM Level 2:
        getElementById: function(id) {
          var rtv = null;
          _visitNode(this.documentElement, function(node) {
            if (node.nodeType == ELEMENT_NODE) {
              if (node.getAttribute("id") == id) {
                rtv = node;
                return true;
              }
            }
          });
          return rtv;
        },
        /**
         * Creates a new `Element` that is owned by this `Document`.
         * In HTML Documents `localName` is the lower cased `tagName`,
         * otherwise no transformation is being applied.
         * When `contentType` implies the HTML namespace, it will be set as `namespaceURI`.
         *
         * __This implementation differs from the specification:__ - The provided name is not checked
         * against the `Name` production,
         * so no related error will be thrown.
         * - There is no interface `HTMLElement`, it is always an `Element`.
         * - There is no support for a second argument to indicate using custom elements.
         *
         * @param {string} tagName
         * @returns {Element}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
         * @see https://dom.spec.whatwg.org/#dom-document-createelement
         * @see https://dom.spec.whatwg.org/#concept-create-element
         */
        createElement: function(tagName) {
          var node = new Element(PDC);
          node.ownerDocument = this;
          if (this.type === "html") {
            tagName = tagName.toLowerCase();
          }
          if (hasDefaultHTMLNamespace(this.contentType)) {
            node.namespaceURI = NAMESPACE.HTML;
          }
          node.nodeName = tagName;
          node.tagName = tagName;
          node.localName = tagName;
          node.childNodes = new NodeList();
          var attrs = node.attributes = new NamedNodeMap();
          attrs._ownerElement = node;
          return node;
        },
        /**
         * @returns {DocumentFragment}
         */
        createDocumentFragment: function() {
          var node = new DocumentFragment(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          return node;
        },
        /**
         * @param {string} data
         * @returns {Text}
         */
        createTextNode: function(data) {
          var node = new Text(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.appendData(data);
          return node;
        },
        /**
         * @param {string} data
         * @returns {Comment}
         */
        createComment: function(data) {
          var node = new Comment(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.appendData(data);
          return node;
        },
        /**
         * @param {string} data
         * @returns {CDATASection}
         */
        createCDATASection: function(data) {
          var node = new CDATASection(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.appendData(data);
          return node;
        },
        /**
         * @param {string} target
         * @param {string} data
         * @returns {ProcessingInstruction}
         */
        createProcessingInstruction: function(target, data) {
          var node = new ProcessingInstruction(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.nodeName = node.target = target;
          node.nodeValue = node.data = data;
          return node;
        },
        /**
         * Creates an `Attr` node that is owned by this document.
         * In HTML Documents `localName` is the lower cased `name`,
         * otherwise no transformation is being applied.
         *
         * __This implementation differs from the specification:__ - The provided name is not checked
         * against the `Name` production,
         * so no related error will be thrown.
         *
         * @param {string} name
         * @returns {Attr}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createAttribute
         * @see https://dom.spec.whatwg.org/#dom-document-createattribute
         */
        createAttribute: function(name) {
          if (!g.QName_exact.test(name)) {
            throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in name "' + name + '"');
          }
          if (this.type === "html") {
            name = name.toLowerCase();
          }
          return this._createAttribute(name);
        },
        _createAttribute: function(name) {
          var node = new Attr(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.name = name;
          node.nodeName = name;
          node.localName = name;
          node.specified = true;
          return node;
        },
        /**
         * Creates an EntityReference object.
         * The current implementation does not fill the `childNodes` with those of the corresponding
         * `Entity`
         *
         * @deprecated
         * In DOM Level 4.
         * @param {string} name
         * The name of the entity to reference. No namespace well-formedness checks are performed.
         * @returns {EntityReference}
         * @throws {DOMException}
         * With code `INVALID_CHARACTER_ERR` when `name` is not valid.
         * @throws {DOMException}
         * with code `NOT_SUPPORTED_ERR` when the document is of type `html`
         * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-392B75AE
         */
        createEntityReference: function(name) {
          if (!g.Name.test(name)) {
            throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'not a valid xml name "' + name + '"');
          }
          if (this.type === "html") {
            throw new DOMException("document is an html document", DOMExceptionName.NotSupportedError);
          }
          var node = new EntityReference(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.nodeName = name;
          return node;
        },
        // Introduced in DOM Level 2:
        /**
         * @param {string} namespaceURI
         * @param {string} qualifiedName
         * @returns {Element}
         */
        createElementNS: function(namespaceURI, qualifiedName) {
          var validated = validateAndExtract(namespaceURI, qualifiedName);
          var node = new Element(PDC);
          var attrs = node.attributes = new NamedNodeMap();
          node.childNodes = new NodeList();
          node.ownerDocument = this;
          node.nodeName = qualifiedName;
          node.tagName = qualifiedName;
          node.namespaceURI = validated[0];
          node.prefix = validated[1];
          node.localName = validated[2];
          attrs._ownerElement = node;
          return node;
        },
        // Introduced in DOM Level 2:
        /**
         * @param {string} namespaceURI
         * @param {string} qualifiedName
         * @returns {Attr}
         */
        createAttributeNS: function(namespaceURI, qualifiedName) {
          var validated = validateAndExtract(namespaceURI, qualifiedName);
          var node = new Attr(PDC);
          node.ownerDocument = this;
          node.childNodes = new NodeList();
          node.nodeName = qualifiedName;
          node.name = qualifiedName;
          node.specified = true;
          node.namespaceURI = validated[0];
          node.prefix = validated[1];
          node.localName = validated[2];
          return node;
        }
      };
      _extends(Document, Node);
      function Element(symbol) {
        checkSymbol(symbol);
        this._nsMap = /* @__PURE__ */ Object.create(null);
      }
      Element.prototype = {
        nodeType: ELEMENT_NODE,
        /**
         * The attributes of this element.
         *
         * @type {NamedNodeMap | null}
         */
        attributes: null,
        getQualifiedName: function() {
          return this.prefix ? this.prefix + ":" + this.localName : this.localName;
        },
        _isInHTMLDocumentAndNamespace: function() {
          return this.ownerDocument.type === "html" && this.namespaceURI === NAMESPACE.HTML;
        },
        /**
         * Implementaton of Level2 Core function hasAttributes.
         *
         * @returns {boolean}
         * True if attribute list is not empty.
         * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-NodeHasAttrs
         */
        hasAttributes: function() {
          return !!(this.attributes && this.attributes.length);
        },
        hasAttribute: function(name) {
          return !!this.getAttributeNode(name);
        },
        /**
         * Returns element’s first attribute whose qualified name is `name`, and `null`
         * if there is no such attribute.
         *
         * @param {string} name
         * @returns {string | null}
         */
        getAttribute: function(name) {
          var attr = this.getAttributeNode(name);
          return attr ? attr.value : null;
        },
        getAttributeNode: function(name) {
          if (this._isInHTMLDocumentAndNamespace()) {
            name = name.toLowerCase();
          }
          return this.attributes.getNamedItem(name);
        },
        /**
         * Sets the value of element’s first attribute whose qualified name is qualifiedName to value.
         *
         * @param {string} name
         * @param {string} value
         */
        setAttribute: function(name, value) {
          if (this._isInHTMLDocumentAndNamespace()) {
            name = name.toLowerCase();
          }
          var attr = this.getAttributeNode(name);
          if (attr) {
            attr.value = attr.nodeValue = "" + value;
          } else {
            attr = this.ownerDocument._createAttribute(name);
            attr.value = attr.nodeValue = "" + value;
            this.setAttributeNode(attr);
          }
        },
        removeAttribute: function(name) {
          var attr = this.getAttributeNode(name);
          attr && this.removeAttributeNode(attr);
        },
        setAttributeNode: function(newAttr) {
          return this.attributes.setNamedItem(newAttr);
        },
        setAttributeNodeNS: function(newAttr) {
          return this.attributes.setNamedItemNS(newAttr);
        },
        removeAttributeNode: function(oldAttr) {
          return this.attributes.removeNamedItem(oldAttr.nodeName);
        },
        //get real attribute name,and remove it by removeAttributeNode
        removeAttributeNS: function(namespaceURI, localName) {
          var old = this.getAttributeNodeNS(namespaceURI, localName);
          old && this.removeAttributeNode(old);
        },
        hasAttributeNS: function(namespaceURI, localName) {
          return this.getAttributeNodeNS(namespaceURI, localName) != null;
        },
        /**
         * Returns element’s attribute whose namespace is `namespaceURI` and local name is
         * `localName`,
         * or `null` if there is no such attribute.
         *
         * @param {string} namespaceURI
         * @param {string} localName
         * @returns {string | null}
         */
        getAttributeNS: function(namespaceURI, localName) {
          var attr = this.getAttributeNodeNS(namespaceURI, localName);
          return attr ? attr.value : null;
        },
        /**
         * Sets the value of element’s attribute whose namespace is `namespaceURI` and local name is
         * `localName` to value.
         *
         * @param {string} namespaceURI
         * @param {string} qualifiedName
         * @param {string} value
         * @see https://dom.spec.whatwg.org/#dom-element-setattributens
         */
        setAttributeNS: function(namespaceURI, qualifiedName, value) {
          var validated = validateAndExtract(namespaceURI, qualifiedName);
          var localName = validated[2];
          var attr = this.getAttributeNodeNS(namespaceURI, localName);
          if (attr) {
            attr.value = attr.nodeValue = "" + value;
          } else {
            attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
            attr.value = attr.nodeValue = "" + value;
            this.setAttributeNode(attr);
          }
        },
        getAttributeNodeNS: function(namespaceURI, localName) {
          return this.attributes.getNamedItemNS(namespaceURI, localName);
        },
        /**
         * Returns a LiveNodeList of all child elements which have **all** of the given class name(s).
         *
         * Returns an empty list if `classNames` is an empty string or only contains HTML white space
         * characters.
         *
         * Warning: This returns a live LiveNodeList.
         * Changes in the DOM will reflect in the array as the changes occur.
         * If an element selected by this array no longer qualifies for the selector,
         * it will automatically be removed. Be aware of this for iteration purposes.
         *
         * @param {string} classNames
         * Is a string representing the class name(s) to match; multiple class names are separated by
         * (ASCII-)whitespace.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
         * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
         */
        getElementsByClassName: function(classNames) {
          var classNamesSet = toOrderedSet(classNames);
          return new LiveNodeList(this, function(base) {
            var ls = [];
            if (classNamesSet.length > 0) {
              _visitNode(base, function(node) {
                if (node !== base && node.nodeType === ELEMENT_NODE) {
                  var nodeClassNames = node.getAttribute("class");
                  if (nodeClassNames) {
                    var matches = classNames === nodeClassNames;
                    if (!matches) {
                      var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                      matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
                    }
                    if (matches) {
                      ls.push(node);
                    }
                  }
                }
              });
            }
            return ls;
          });
        },
        /**
         * Returns a LiveNodeList of elements with the given qualifiedName.
         * Searching for all descendants can be done by passing `*` as `qualifiedName`.
         *
         * All descendants of the specified element are searched, but not the element itself.
         * The returned list is live, which means it updates itself with the DOM tree automatically.
         * Therefore, there is no need to call `Element.getElementsByTagName()`
         * with the same element and arguments repeatedly if the DOM changes in between calls.
         *
         * When called on an HTML element in an HTML document,
         * `getElementsByTagName` lower-cases the argument before searching for it.
         * This is undesirable when trying to match camel-cased SVG elements (such as
         * `<linearGradient>`) in an HTML document.
         * Instead, use `Element.getElementsByTagNameNS()`,
         * which preserves the capitalization of the tag name.
         *
         * `Element.getElementsByTagName` is similar to `Document.getElementsByTagName()`,
         * except that it only searches for elements that are descendants of the specified element.
         *
         * @param {string} qualifiedName
         * @returns {LiveNodeList}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
         * @see https://dom.spec.whatwg.org/#concept-getelementsbytagname
         */
        getElementsByTagName: function(qualifiedName) {
          var isHTMLDocument = (this.nodeType === DOCUMENT_NODE ? this : this.ownerDocument).type === "html";
          var lowerQualifiedName = qualifiedName.toLowerCase();
          return new LiveNodeList(this, function(base) {
            var ls = [];
            _visitNode(base, function(node) {
              if (node === base || node.nodeType !== ELEMENT_NODE) {
                return;
              }
              if (qualifiedName === "*") {
                ls.push(node);
              } else {
                var nodeQualifiedName = node.getQualifiedName();
                var matchingQName = isHTMLDocument && node.namespaceURI === NAMESPACE.HTML ? lowerQualifiedName : qualifiedName;
                if (nodeQualifiedName === matchingQName) {
                  ls.push(node);
                }
              }
            });
            return ls;
          });
        },
        getElementsByTagNameNS: function(namespaceURI, localName) {
          return new LiveNodeList(this, function(base) {
            var ls = [];
            _visitNode(base, function(node) {
              if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName === "*" || node.localName == localName)) {
                ls.push(node);
              }
            });
            return ls;
          });
        }
      };
      Document.prototype.getElementsByClassName = Element.prototype.getElementsByClassName;
      Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
      Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
      _extends(Element, Node);
      function Attr(symbol) {
        checkSymbol(symbol);
        this.namespaceURI = null;
        this.prefix = null;
        this.ownerElement = null;
      }
      Attr.prototype.nodeType = ATTRIBUTE_NODE;
      _extends(Attr, Node);
      function CharacterData(symbol) {
        checkSymbol(symbol);
      }
      CharacterData.prototype = {
        data: "",
        substringData: function(offset, count) {
          return this.data.substring(offset, offset + count);
        },
        appendData: function(text) {
          text = this.data + text;
          this.nodeValue = this.data = text;
          this.length = text.length;
        },
        insertData: function(offset, text) {
          this.replaceData(offset, 0, text);
        },
        deleteData: function(offset, count) {
          this.replaceData(offset, count, "");
        },
        replaceData: function(offset, count, text) {
          var start = this.data.substring(0, offset);
          var end = this.data.substring(offset + count);
          text = start + text + end;
          this.nodeValue = this.data = text;
          this.length = text.length;
        }
      };
      _extends(CharacterData, Node);
      function Text(symbol) {
        checkSymbol(symbol);
      }
      Text.prototype = {
        nodeName: "#text",
        nodeType: TEXT_NODE,
        splitText: function(offset) {
          var text = this.data;
          var newText = text.substring(offset);
          text = text.substring(0, offset);
          this.data = this.nodeValue = text;
          this.length = text.length;
          var newNode = this.ownerDocument.createTextNode(newText);
          if (this.parentNode) {
            this.parentNode.insertBefore(newNode, this.nextSibling);
          }
          return newNode;
        }
      };
      _extends(Text, CharacterData);
      function Comment(symbol) {
        checkSymbol(symbol);
      }
      Comment.prototype = {
        nodeName: "#comment",
        nodeType: COMMENT_NODE
      };
      _extends(Comment, CharacterData);
      function CDATASection(symbol) {
        checkSymbol(symbol);
      }
      CDATASection.prototype = {
        nodeName: "#cdata-section",
        nodeType: CDATA_SECTION_NODE
      };
      _extends(CDATASection, Text);
      function DocumentType(symbol) {
        checkSymbol(symbol);
      }
      DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
      _extends(DocumentType, Node);
      function Notation(symbol) {
        checkSymbol(symbol);
      }
      Notation.prototype.nodeType = NOTATION_NODE;
      _extends(Notation, Node);
      function Entity(symbol) {
        checkSymbol(symbol);
      }
      Entity.prototype.nodeType = ENTITY_NODE;
      _extends(Entity, Node);
      function EntityReference(symbol) {
        checkSymbol(symbol);
      }
      EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
      _extends(EntityReference, Node);
      function DocumentFragment(symbol) {
        checkSymbol(symbol);
      }
      DocumentFragment.prototype.nodeName = "#document-fragment";
      DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
      _extends(DocumentFragment, Node);
      function ProcessingInstruction(symbol) {
        checkSymbol(symbol);
      }
      ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
      _extends(ProcessingInstruction, CharacterData);
      function XMLSerializer2() {
      }
      XMLSerializer2.prototype.serializeToString = function(node, nodeFilter) {
        return nodeSerializeToString.call(node, nodeFilter);
      };
      Node.prototype.toString = nodeSerializeToString;
      function nodeSerializeToString(nodeFilter) {
        var buf = [];
        var refNode = this.nodeType === DOCUMENT_NODE && this.documentElement || this;
        var prefix = refNode.prefix;
        var uri = refNode.namespaceURI;
        if (uri && prefix == null) {
          var prefix = refNode.lookupPrefix(uri);
          if (prefix == null) {
            var visibleNamespaces = [
              { namespace: uri, prefix: null }
              //{namespace:uri,prefix:''}
            ];
          }
        }
        serializeToString(this, buf, nodeFilter, visibleNamespaces);
        return buf.join("");
      }
      function needNamespaceDefine(node, isHTML, visibleNamespaces) {
        var prefix = node.prefix || "";
        var uri = node.namespaceURI;
        if (!uri) {
          return false;
        }
        if (prefix === "xml" && uri === NAMESPACE.XML || uri === NAMESPACE.XMLNS) {
          return false;
        }
        var i = visibleNamespaces.length;
        while (i--) {
          var ns = visibleNamespaces[i];
          if (ns.prefix === prefix) {
            return ns.namespace !== uri;
          }
        }
        return true;
      }
      function addSerializedAttribute(buf, qualifiedName, value) {
        buf.push(" ", qualifiedName, '="', value.replace(/[<>&"\t\n\r]/g, _xmlEncoder), '"');
      }
      function serializeToString(node, buf, nodeFilter, visibleNamespaces) {
        if (!visibleNamespaces) {
          visibleNamespaces = [];
        }
        var doc = node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument;
        var isHTML = doc.type === "html";
        if (nodeFilter) {
          node = nodeFilter(node);
          if (node) {
            if (typeof node == "string") {
              buf.push(node);
              return;
            }
          } else {
            return;
          }
        }
        switch (node.nodeType) {
          case ELEMENT_NODE:
            var attrs = node.attributes;
            var len = attrs.length;
            var child = node.firstChild;
            var nodeName = node.tagName;
            var prefixedNodeName = nodeName;
            if (!isHTML && !node.prefix && node.namespaceURI) {
              var defaultNS;
              for (var ai = 0; ai < attrs.length; ai++) {
                if (attrs.item(ai).name === "xmlns") {
                  defaultNS = attrs.item(ai).value;
                  break;
                }
              }
              if (!defaultNS) {
                for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                  var namespace = visibleNamespaces[nsi];
                  if (namespace.prefix === "" && namespace.namespace === node.namespaceURI) {
                    defaultNS = namespace.namespace;
                    break;
                  }
                }
              }
              if (defaultNS !== node.namespaceURI) {
                for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                  var namespace = visibleNamespaces[nsi];
                  if (namespace.namespace === node.namespaceURI) {
                    if (namespace.prefix) {
                      prefixedNodeName = namespace.prefix + ":" + nodeName;
                    }
                    break;
                  }
                }
              }
            }
            buf.push("<", prefixedNodeName);
            for (var i = 0; i < len; i++) {
              var attr = attrs.item(i);
              if (attr.prefix == "xmlns") {
                visibleNamespaces.push({
                  prefix: attr.localName,
                  namespace: attr.value
                });
              } else if (attr.nodeName == "xmlns") {
                visibleNamespaces.push({ prefix: "", namespace: attr.value });
              }
            }
            for (var i = 0; i < len; i++) {
              var attr = attrs.item(i);
              if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
                var prefix = attr.prefix || "";
                var uri = attr.namespaceURI;
                addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
                visibleNamespaces.push({ prefix, namespace: uri });
              }
              serializeToString(attr, buf, nodeFilter, visibleNamespaces);
            }
            if (nodeName === prefixedNodeName && needNamespaceDefine(node, isHTML, visibleNamespaces)) {
              var prefix = node.prefix || "";
              var uri = node.namespaceURI;
              addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
              visibleNamespaces.push({ prefix, namespace: uri });
            }
            var canCloseTag = !child;
            if (canCloseTag && (isHTML || node.namespaceURI === NAMESPACE.HTML)) {
              canCloseTag = isHTMLVoidElement(nodeName);
            }
            if (canCloseTag) {
              buf.push("/>");
            } else {
              buf.push(">");
              if (isHTML && isHTMLRawTextElement(nodeName)) {
                while (child) {
                  if (child.data) {
                    buf.push(child.data);
                  } else {
                    serializeToString(child, buf, nodeFilter, visibleNamespaces.slice());
                  }
                  child = child.nextSibling;
                }
              } else {
                while (child) {
                  serializeToString(child, buf, nodeFilter, visibleNamespaces.slice());
                  child = child.nextSibling;
                }
              }
              buf.push("</", prefixedNodeName, ">");
            }
            return;
          case DOCUMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            var child = node.firstChild;
            while (child) {
              serializeToString(child, buf, nodeFilter, visibleNamespaces.slice());
              child = child.nextSibling;
            }
            return;
          case ATTRIBUTE_NODE:
            return addSerializedAttribute(buf, node.name, node.value);
          case TEXT_NODE:
            return buf.push(node.data.replace(/[<&>]/g, _xmlEncoder));
          case CDATA_SECTION_NODE:
            return buf.push(g.CDATA_START, node.data, g.CDATA_END);
          case COMMENT_NODE:
            return buf.push(g.COMMENT_START, node.data, g.COMMENT_END);
          case DOCUMENT_TYPE_NODE:
            var pubid = node.publicId;
            var sysid = node.systemId;
            buf.push(g.DOCTYPE_DECL_START, " ", node.name);
            if (pubid) {
              buf.push(" ", g.PUBLIC, " ", pubid);
              if (sysid && sysid !== ".") {
                buf.push(" ", sysid);
              }
            } else if (sysid && sysid !== ".") {
              buf.push(" ", g.SYSTEM, " ", sysid);
            }
            if (node.internalSubset) {
              buf.push(" [", node.internalSubset, "]");
            }
            buf.push(">");
            return;
          case PROCESSING_INSTRUCTION_NODE:
            return buf.push("<?", node.target, " ", node.data, "?>");
          case ENTITY_REFERENCE_NODE:
            return buf.push("&", node.nodeName, ";");
          //case ENTITY_NODE:
          //case NOTATION_NODE:
          default:
            buf.push("??", node.nodeName);
        }
      }
      function importNode(doc, node, deep) {
        var node2;
        switch (node.nodeType) {
          case ELEMENT_NODE:
            node2 = node.cloneNode(false);
            node2.ownerDocument = doc;
          //var attrs = node2.attributes;
          //var len = attrs.length;
          //for(var i=0;i<len;i++){
          //node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
          //}
          case DOCUMENT_FRAGMENT_NODE:
            break;
          case ATTRIBUTE_NODE:
            deep = true;
            break;
        }
        if (!node2) {
          node2 = node.cloneNode(false);
        }
        node2.ownerDocument = doc;
        node2.parentNode = null;
        if (deep) {
          var child = node.firstChild;
          while (child) {
            node2.appendChild(importNode(doc, child, deep));
            child = child.nextSibling;
          }
        }
        return node2;
      }
      function cloneNode(doc, node, deep) {
        var node2 = new node.constructor(PDC);
        for (var n in node) {
          if (hasOwn(node, n)) {
            var v = node[n];
            if (typeof v != "object") {
              if (v != node2[n]) {
                node2[n] = v;
              }
            }
          }
        }
        if (node.childNodes) {
          node2.childNodes = new NodeList();
        }
        node2.ownerDocument = doc;
        switch (node2.nodeType) {
          case ELEMENT_NODE:
            var attrs = node.attributes;
            var attrs2 = node2.attributes = new NamedNodeMap();
            var len = attrs.length;
            attrs2._ownerElement = node2;
            for (var i = 0; i < len; i++) {
              node2.setAttributeNode(cloneNode(doc, attrs.item(i), true));
            }
            break;
          case ATTRIBUTE_NODE:
            deep = true;
        }
        if (deep) {
          var child = node.firstChild;
          while (child) {
            node2.appendChild(cloneNode(doc, child, deep));
            child = child.nextSibling;
          }
        }
        return node2;
      }
      function __set__(object, key, value) {
        object[key] = value;
      }
      try {
        if (Object.defineProperty) {
          let getTextContent = function(node) {
            switch (node.nodeType) {
              case ELEMENT_NODE:
              case DOCUMENT_FRAGMENT_NODE:
                var buf = [];
                node = node.firstChild;
                while (node) {
                  if (node.nodeType !== 7 && node.nodeType !== 8) {
                    buf.push(getTextContent(node));
                  }
                  node = node.nextSibling;
                }
                return buf.join("");
              default:
                return node.nodeValue;
            }
          };
          Object.defineProperty(LiveNodeList.prototype, "length", {
            get: function() {
              _updateLiveList(this);
              return this.$$length;
            }
          });
          Object.defineProperty(Node.prototype, "textContent", {
            get: function() {
              return getTextContent(this);
            },
            set: function(data) {
              switch (this.nodeType) {
                case ELEMENT_NODE:
                case DOCUMENT_FRAGMENT_NODE:
                  while (this.firstChild) {
                    this.removeChild(this.firstChild);
                  }
                  if (data || String(data)) {
                    this.appendChild(this.ownerDocument.createTextNode(data));
                  }
                  break;
                default:
                  this.data = data;
                  this.value = data;
                  this.nodeValue = data;
              }
            }
          });
          __set__ = function(object, key, value) {
            object["$$" + key] = value;
          };
        }
      } catch (e) {
      }
      exports2._updateLiveList = _updateLiveList;
      exports2.Attr = Attr;
      exports2.CDATASection = CDATASection;
      exports2.CharacterData = CharacterData;
      exports2.Comment = Comment;
      exports2.Document = Document;
      exports2.DocumentFragment = DocumentFragment;
      exports2.DocumentType = DocumentType;
      exports2.DOMImplementation = DOMImplementation;
      exports2.Element = Element;
      exports2.Entity = Entity;
      exports2.EntityReference = EntityReference;
      exports2.LiveNodeList = LiveNodeList;
      exports2.NamedNodeMap = NamedNodeMap;
      exports2.Node = Node;
      exports2.NodeList = NodeList;
      exports2.Notation = Notation;
      exports2.Text = Text;
      exports2.ProcessingInstruction = ProcessingInstruction;
      exports2.XMLSerializer = XMLSerializer2;
    }
  });

  // node_modules/@xmldom/xmldom/lib/entities.js
  var require_entities = __commonJS({
    "node_modules/@xmldom/xmldom/lib/entities.js"(exports2) {
      "use strict";
      var freeze = require_conventions().freeze;
      exports2.XML_ENTITIES = freeze({
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        quot: '"'
      });
      exports2.HTML_ENTITIES = freeze({
        Aacute: "\xC1",
        aacute: "\xE1",
        Abreve: "\u0102",
        abreve: "\u0103",
        ac: "\u223E",
        acd: "\u223F",
        acE: "\u223E\u0333",
        Acirc: "\xC2",
        acirc: "\xE2",
        acute: "\xB4",
        Acy: "\u0410",
        acy: "\u0430",
        AElig: "\xC6",
        aelig: "\xE6",
        af: "\u2061",
        Afr: "\u{1D504}",
        afr: "\u{1D51E}",
        Agrave: "\xC0",
        agrave: "\xE0",
        alefsym: "\u2135",
        aleph: "\u2135",
        Alpha: "\u0391",
        alpha: "\u03B1",
        Amacr: "\u0100",
        amacr: "\u0101",
        amalg: "\u2A3F",
        AMP: "&",
        amp: "&",
        And: "\u2A53",
        and: "\u2227",
        andand: "\u2A55",
        andd: "\u2A5C",
        andslope: "\u2A58",
        andv: "\u2A5A",
        ang: "\u2220",
        ange: "\u29A4",
        angle: "\u2220",
        angmsd: "\u2221",
        angmsdaa: "\u29A8",
        angmsdab: "\u29A9",
        angmsdac: "\u29AA",
        angmsdad: "\u29AB",
        angmsdae: "\u29AC",
        angmsdaf: "\u29AD",
        angmsdag: "\u29AE",
        angmsdah: "\u29AF",
        angrt: "\u221F",
        angrtvb: "\u22BE",
        angrtvbd: "\u299D",
        angsph: "\u2222",
        angst: "\xC5",
        angzarr: "\u237C",
        Aogon: "\u0104",
        aogon: "\u0105",
        Aopf: "\u{1D538}",
        aopf: "\u{1D552}",
        ap: "\u2248",
        apacir: "\u2A6F",
        apE: "\u2A70",
        ape: "\u224A",
        apid: "\u224B",
        apos: "'",
        ApplyFunction: "\u2061",
        approx: "\u2248",
        approxeq: "\u224A",
        Aring: "\xC5",
        aring: "\xE5",
        Ascr: "\u{1D49C}",
        ascr: "\u{1D4B6}",
        Assign: "\u2254",
        ast: "*",
        asymp: "\u2248",
        asympeq: "\u224D",
        Atilde: "\xC3",
        atilde: "\xE3",
        Auml: "\xC4",
        auml: "\xE4",
        awconint: "\u2233",
        awint: "\u2A11",
        backcong: "\u224C",
        backepsilon: "\u03F6",
        backprime: "\u2035",
        backsim: "\u223D",
        backsimeq: "\u22CD",
        Backslash: "\u2216",
        Barv: "\u2AE7",
        barvee: "\u22BD",
        Barwed: "\u2306",
        barwed: "\u2305",
        barwedge: "\u2305",
        bbrk: "\u23B5",
        bbrktbrk: "\u23B6",
        bcong: "\u224C",
        Bcy: "\u0411",
        bcy: "\u0431",
        bdquo: "\u201E",
        becaus: "\u2235",
        Because: "\u2235",
        because: "\u2235",
        bemptyv: "\u29B0",
        bepsi: "\u03F6",
        bernou: "\u212C",
        Bernoullis: "\u212C",
        Beta: "\u0392",
        beta: "\u03B2",
        beth: "\u2136",
        between: "\u226C",
        Bfr: "\u{1D505}",
        bfr: "\u{1D51F}",
        bigcap: "\u22C2",
        bigcirc: "\u25EF",
        bigcup: "\u22C3",
        bigodot: "\u2A00",
        bigoplus: "\u2A01",
        bigotimes: "\u2A02",
        bigsqcup: "\u2A06",
        bigstar: "\u2605",
        bigtriangledown: "\u25BD",
        bigtriangleup: "\u25B3",
        biguplus: "\u2A04",
        bigvee: "\u22C1",
        bigwedge: "\u22C0",
        bkarow: "\u290D",
        blacklozenge: "\u29EB",
        blacksquare: "\u25AA",
        blacktriangle: "\u25B4",
        blacktriangledown: "\u25BE",
        blacktriangleleft: "\u25C2",
        blacktriangleright: "\u25B8",
        blank: "\u2423",
        blk12: "\u2592",
        blk14: "\u2591",
        blk34: "\u2593",
        block: "\u2588",
        bne: "=\u20E5",
        bnequiv: "\u2261\u20E5",
        bNot: "\u2AED",
        bnot: "\u2310",
        Bopf: "\u{1D539}",
        bopf: "\u{1D553}",
        bot: "\u22A5",
        bottom: "\u22A5",
        bowtie: "\u22C8",
        boxbox: "\u29C9",
        boxDL: "\u2557",
        boxDl: "\u2556",
        boxdL: "\u2555",
        boxdl: "\u2510",
        boxDR: "\u2554",
        boxDr: "\u2553",
        boxdR: "\u2552",
        boxdr: "\u250C",
        boxH: "\u2550",
        boxh: "\u2500",
        boxHD: "\u2566",
        boxHd: "\u2564",
        boxhD: "\u2565",
        boxhd: "\u252C",
        boxHU: "\u2569",
        boxHu: "\u2567",
        boxhU: "\u2568",
        boxhu: "\u2534",
        boxminus: "\u229F",
        boxplus: "\u229E",
        boxtimes: "\u22A0",
        boxUL: "\u255D",
        boxUl: "\u255C",
        boxuL: "\u255B",
        boxul: "\u2518",
        boxUR: "\u255A",
        boxUr: "\u2559",
        boxuR: "\u2558",
        boxur: "\u2514",
        boxV: "\u2551",
        boxv: "\u2502",
        boxVH: "\u256C",
        boxVh: "\u256B",
        boxvH: "\u256A",
        boxvh: "\u253C",
        boxVL: "\u2563",
        boxVl: "\u2562",
        boxvL: "\u2561",
        boxvl: "\u2524",
        boxVR: "\u2560",
        boxVr: "\u255F",
        boxvR: "\u255E",
        boxvr: "\u251C",
        bprime: "\u2035",
        Breve: "\u02D8",
        breve: "\u02D8",
        brvbar: "\xA6",
        Bscr: "\u212C",
        bscr: "\u{1D4B7}",
        bsemi: "\u204F",
        bsim: "\u223D",
        bsime: "\u22CD",
        bsol: "\\",
        bsolb: "\u29C5",
        bsolhsub: "\u27C8",
        bull: "\u2022",
        bullet: "\u2022",
        bump: "\u224E",
        bumpE: "\u2AAE",
        bumpe: "\u224F",
        Bumpeq: "\u224E",
        bumpeq: "\u224F",
        Cacute: "\u0106",
        cacute: "\u0107",
        Cap: "\u22D2",
        cap: "\u2229",
        capand: "\u2A44",
        capbrcup: "\u2A49",
        capcap: "\u2A4B",
        capcup: "\u2A47",
        capdot: "\u2A40",
        CapitalDifferentialD: "\u2145",
        caps: "\u2229\uFE00",
        caret: "\u2041",
        caron: "\u02C7",
        Cayleys: "\u212D",
        ccaps: "\u2A4D",
        Ccaron: "\u010C",
        ccaron: "\u010D",
        Ccedil: "\xC7",
        ccedil: "\xE7",
        Ccirc: "\u0108",
        ccirc: "\u0109",
        Cconint: "\u2230",
        ccups: "\u2A4C",
        ccupssm: "\u2A50",
        Cdot: "\u010A",
        cdot: "\u010B",
        cedil: "\xB8",
        Cedilla: "\xB8",
        cemptyv: "\u29B2",
        cent: "\xA2",
        CenterDot: "\xB7",
        centerdot: "\xB7",
        Cfr: "\u212D",
        cfr: "\u{1D520}",
        CHcy: "\u0427",
        chcy: "\u0447",
        check: "\u2713",
        checkmark: "\u2713",
        Chi: "\u03A7",
        chi: "\u03C7",
        cir: "\u25CB",
        circ: "\u02C6",
        circeq: "\u2257",
        circlearrowleft: "\u21BA",
        circlearrowright: "\u21BB",
        circledast: "\u229B",
        circledcirc: "\u229A",
        circleddash: "\u229D",
        CircleDot: "\u2299",
        circledR: "\xAE",
        circledS: "\u24C8",
        CircleMinus: "\u2296",
        CirclePlus: "\u2295",
        CircleTimes: "\u2297",
        cirE: "\u29C3",
        cire: "\u2257",
        cirfnint: "\u2A10",
        cirmid: "\u2AEF",
        cirscir: "\u29C2",
        ClockwiseContourIntegral: "\u2232",
        CloseCurlyDoubleQuote: "\u201D",
        CloseCurlyQuote: "\u2019",
        clubs: "\u2663",
        clubsuit: "\u2663",
        Colon: "\u2237",
        colon: ":",
        Colone: "\u2A74",
        colone: "\u2254",
        coloneq: "\u2254",
        comma: ",",
        commat: "@",
        comp: "\u2201",
        compfn: "\u2218",
        complement: "\u2201",
        complexes: "\u2102",
        cong: "\u2245",
        congdot: "\u2A6D",
        Congruent: "\u2261",
        Conint: "\u222F",
        conint: "\u222E",
        ContourIntegral: "\u222E",
        Copf: "\u2102",
        copf: "\u{1D554}",
        coprod: "\u2210",
        Coproduct: "\u2210",
        COPY: "\xA9",
        copy: "\xA9",
        copysr: "\u2117",
        CounterClockwiseContourIntegral: "\u2233",
        crarr: "\u21B5",
        Cross: "\u2A2F",
        cross: "\u2717",
        Cscr: "\u{1D49E}",
        cscr: "\u{1D4B8}",
        csub: "\u2ACF",
        csube: "\u2AD1",
        csup: "\u2AD0",
        csupe: "\u2AD2",
        ctdot: "\u22EF",
        cudarrl: "\u2938",
        cudarrr: "\u2935",
        cuepr: "\u22DE",
        cuesc: "\u22DF",
        cularr: "\u21B6",
        cularrp: "\u293D",
        Cup: "\u22D3",
        cup: "\u222A",
        cupbrcap: "\u2A48",
        CupCap: "\u224D",
        cupcap: "\u2A46",
        cupcup: "\u2A4A",
        cupdot: "\u228D",
        cupor: "\u2A45",
        cups: "\u222A\uFE00",
        curarr: "\u21B7",
        curarrm: "\u293C",
        curlyeqprec: "\u22DE",
        curlyeqsucc: "\u22DF",
        curlyvee: "\u22CE",
        curlywedge: "\u22CF",
        curren: "\xA4",
        curvearrowleft: "\u21B6",
        curvearrowright: "\u21B7",
        cuvee: "\u22CE",
        cuwed: "\u22CF",
        cwconint: "\u2232",
        cwint: "\u2231",
        cylcty: "\u232D",
        Dagger: "\u2021",
        dagger: "\u2020",
        daleth: "\u2138",
        Darr: "\u21A1",
        dArr: "\u21D3",
        darr: "\u2193",
        dash: "\u2010",
        Dashv: "\u2AE4",
        dashv: "\u22A3",
        dbkarow: "\u290F",
        dblac: "\u02DD",
        Dcaron: "\u010E",
        dcaron: "\u010F",
        Dcy: "\u0414",
        dcy: "\u0434",
        DD: "\u2145",
        dd: "\u2146",
        ddagger: "\u2021",
        ddarr: "\u21CA",
        DDotrahd: "\u2911",
        ddotseq: "\u2A77",
        deg: "\xB0",
        Del: "\u2207",
        Delta: "\u0394",
        delta: "\u03B4",
        demptyv: "\u29B1",
        dfisht: "\u297F",
        Dfr: "\u{1D507}",
        dfr: "\u{1D521}",
        dHar: "\u2965",
        dharl: "\u21C3",
        dharr: "\u21C2",
        DiacriticalAcute: "\xB4",
        DiacriticalDot: "\u02D9",
        DiacriticalDoubleAcute: "\u02DD",
        DiacriticalGrave: "`",
        DiacriticalTilde: "\u02DC",
        diam: "\u22C4",
        Diamond: "\u22C4",
        diamond: "\u22C4",
        diamondsuit: "\u2666",
        diams: "\u2666",
        die: "\xA8",
        DifferentialD: "\u2146",
        digamma: "\u03DD",
        disin: "\u22F2",
        div: "\xF7",
        divide: "\xF7",
        divideontimes: "\u22C7",
        divonx: "\u22C7",
        DJcy: "\u0402",
        djcy: "\u0452",
        dlcorn: "\u231E",
        dlcrop: "\u230D",
        dollar: "$",
        Dopf: "\u{1D53B}",
        dopf: "\u{1D555}",
        Dot: "\xA8",
        dot: "\u02D9",
        DotDot: "\u20DC",
        doteq: "\u2250",
        doteqdot: "\u2251",
        DotEqual: "\u2250",
        dotminus: "\u2238",
        dotplus: "\u2214",
        dotsquare: "\u22A1",
        doublebarwedge: "\u2306",
        DoubleContourIntegral: "\u222F",
        DoubleDot: "\xA8",
        DoubleDownArrow: "\u21D3",
        DoubleLeftArrow: "\u21D0",
        DoubleLeftRightArrow: "\u21D4",
        DoubleLeftTee: "\u2AE4",
        DoubleLongLeftArrow: "\u27F8",
        DoubleLongLeftRightArrow: "\u27FA",
        DoubleLongRightArrow: "\u27F9",
        DoubleRightArrow: "\u21D2",
        DoubleRightTee: "\u22A8",
        DoubleUpArrow: "\u21D1",
        DoubleUpDownArrow: "\u21D5",
        DoubleVerticalBar: "\u2225",
        DownArrow: "\u2193",
        Downarrow: "\u21D3",
        downarrow: "\u2193",
        DownArrowBar: "\u2913",
        DownArrowUpArrow: "\u21F5",
        DownBreve: "\u0311",
        downdownarrows: "\u21CA",
        downharpoonleft: "\u21C3",
        downharpoonright: "\u21C2",
        DownLeftRightVector: "\u2950",
        DownLeftTeeVector: "\u295E",
        DownLeftVector: "\u21BD",
        DownLeftVectorBar: "\u2956",
        DownRightTeeVector: "\u295F",
        DownRightVector: "\u21C1",
        DownRightVectorBar: "\u2957",
        DownTee: "\u22A4",
        DownTeeArrow: "\u21A7",
        drbkarow: "\u2910",
        drcorn: "\u231F",
        drcrop: "\u230C",
        Dscr: "\u{1D49F}",
        dscr: "\u{1D4B9}",
        DScy: "\u0405",
        dscy: "\u0455",
        dsol: "\u29F6",
        Dstrok: "\u0110",
        dstrok: "\u0111",
        dtdot: "\u22F1",
        dtri: "\u25BF",
        dtrif: "\u25BE",
        duarr: "\u21F5",
        duhar: "\u296F",
        dwangle: "\u29A6",
        DZcy: "\u040F",
        dzcy: "\u045F",
        dzigrarr: "\u27FF",
        Eacute: "\xC9",
        eacute: "\xE9",
        easter: "\u2A6E",
        Ecaron: "\u011A",
        ecaron: "\u011B",
        ecir: "\u2256",
        Ecirc: "\xCA",
        ecirc: "\xEA",
        ecolon: "\u2255",
        Ecy: "\u042D",
        ecy: "\u044D",
        eDDot: "\u2A77",
        Edot: "\u0116",
        eDot: "\u2251",
        edot: "\u0117",
        ee: "\u2147",
        efDot: "\u2252",
        Efr: "\u{1D508}",
        efr: "\u{1D522}",
        eg: "\u2A9A",
        Egrave: "\xC8",
        egrave: "\xE8",
        egs: "\u2A96",
        egsdot: "\u2A98",
        el: "\u2A99",
        Element: "\u2208",
        elinters: "\u23E7",
        ell: "\u2113",
        els: "\u2A95",
        elsdot: "\u2A97",
        Emacr: "\u0112",
        emacr: "\u0113",
        empty: "\u2205",
        emptyset: "\u2205",
        EmptySmallSquare: "\u25FB",
        emptyv: "\u2205",
        EmptyVerySmallSquare: "\u25AB",
        emsp: "\u2003",
        emsp13: "\u2004",
        emsp14: "\u2005",
        ENG: "\u014A",
        eng: "\u014B",
        ensp: "\u2002",
        Eogon: "\u0118",
        eogon: "\u0119",
        Eopf: "\u{1D53C}",
        eopf: "\u{1D556}",
        epar: "\u22D5",
        eparsl: "\u29E3",
        eplus: "\u2A71",
        epsi: "\u03B5",
        Epsilon: "\u0395",
        epsilon: "\u03B5",
        epsiv: "\u03F5",
        eqcirc: "\u2256",
        eqcolon: "\u2255",
        eqsim: "\u2242",
        eqslantgtr: "\u2A96",
        eqslantless: "\u2A95",
        Equal: "\u2A75",
        equals: "=",
        EqualTilde: "\u2242",
        equest: "\u225F",
        Equilibrium: "\u21CC",
        equiv: "\u2261",
        equivDD: "\u2A78",
        eqvparsl: "\u29E5",
        erarr: "\u2971",
        erDot: "\u2253",
        Escr: "\u2130",
        escr: "\u212F",
        esdot: "\u2250",
        Esim: "\u2A73",
        esim: "\u2242",
        Eta: "\u0397",
        eta: "\u03B7",
        ETH: "\xD0",
        eth: "\xF0",
        Euml: "\xCB",
        euml: "\xEB",
        euro: "\u20AC",
        excl: "!",
        exist: "\u2203",
        Exists: "\u2203",
        expectation: "\u2130",
        ExponentialE: "\u2147",
        exponentiale: "\u2147",
        fallingdotseq: "\u2252",
        Fcy: "\u0424",
        fcy: "\u0444",
        female: "\u2640",
        ffilig: "\uFB03",
        fflig: "\uFB00",
        ffllig: "\uFB04",
        Ffr: "\u{1D509}",
        ffr: "\u{1D523}",
        filig: "\uFB01",
        FilledSmallSquare: "\u25FC",
        FilledVerySmallSquare: "\u25AA",
        fjlig: "fj",
        flat: "\u266D",
        fllig: "\uFB02",
        fltns: "\u25B1",
        fnof: "\u0192",
        Fopf: "\u{1D53D}",
        fopf: "\u{1D557}",
        ForAll: "\u2200",
        forall: "\u2200",
        fork: "\u22D4",
        forkv: "\u2AD9",
        Fouriertrf: "\u2131",
        fpartint: "\u2A0D",
        frac12: "\xBD",
        frac13: "\u2153",
        frac14: "\xBC",
        frac15: "\u2155",
        frac16: "\u2159",
        frac18: "\u215B",
        frac23: "\u2154",
        frac25: "\u2156",
        frac34: "\xBE",
        frac35: "\u2157",
        frac38: "\u215C",
        frac45: "\u2158",
        frac56: "\u215A",
        frac58: "\u215D",
        frac78: "\u215E",
        frasl: "\u2044",
        frown: "\u2322",
        Fscr: "\u2131",
        fscr: "\u{1D4BB}",
        gacute: "\u01F5",
        Gamma: "\u0393",
        gamma: "\u03B3",
        Gammad: "\u03DC",
        gammad: "\u03DD",
        gap: "\u2A86",
        Gbreve: "\u011E",
        gbreve: "\u011F",
        Gcedil: "\u0122",
        Gcirc: "\u011C",
        gcirc: "\u011D",
        Gcy: "\u0413",
        gcy: "\u0433",
        Gdot: "\u0120",
        gdot: "\u0121",
        gE: "\u2267",
        ge: "\u2265",
        gEl: "\u2A8C",
        gel: "\u22DB",
        geq: "\u2265",
        geqq: "\u2267",
        geqslant: "\u2A7E",
        ges: "\u2A7E",
        gescc: "\u2AA9",
        gesdot: "\u2A80",
        gesdoto: "\u2A82",
        gesdotol: "\u2A84",
        gesl: "\u22DB\uFE00",
        gesles: "\u2A94",
        Gfr: "\u{1D50A}",
        gfr: "\u{1D524}",
        Gg: "\u22D9",
        gg: "\u226B",
        ggg: "\u22D9",
        gimel: "\u2137",
        GJcy: "\u0403",
        gjcy: "\u0453",
        gl: "\u2277",
        gla: "\u2AA5",
        glE: "\u2A92",
        glj: "\u2AA4",
        gnap: "\u2A8A",
        gnapprox: "\u2A8A",
        gnE: "\u2269",
        gne: "\u2A88",
        gneq: "\u2A88",
        gneqq: "\u2269",
        gnsim: "\u22E7",
        Gopf: "\u{1D53E}",
        gopf: "\u{1D558}",
        grave: "`",
        GreaterEqual: "\u2265",
        GreaterEqualLess: "\u22DB",
        GreaterFullEqual: "\u2267",
        GreaterGreater: "\u2AA2",
        GreaterLess: "\u2277",
        GreaterSlantEqual: "\u2A7E",
        GreaterTilde: "\u2273",
        Gscr: "\u{1D4A2}",
        gscr: "\u210A",
        gsim: "\u2273",
        gsime: "\u2A8E",
        gsiml: "\u2A90",
        Gt: "\u226B",
        GT: ">",
        gt: ">",
        gtcc: "\u2AA7",
        gtcir: "\u2A7A",
        gtdot: "\u22D7",
        gtlPar: "\u2995",
        gtquest: "\u2A7C",
        gtrapprox: "\u2A86",
        gtrarr: "\u2978",
        gtrdot: "\u22D7",
        gtreqless: "\u22DB",
        gtreqqless: "\u2A8C",
        gtrless: "\u2277",
        gtrsim: "\u2273",
        gvertneqq: "\u2269\uFE00",
        gvnE: "\u2269\uFE00",
        Hacek: "\u02C7",
        hairsp: "\u200A",
        half: "\xBD",
        hamilt: "\u210B",
        HARDcy: "\u042A",
        hardcy: "\u044A",
        hArr: "\u21D4",
        harr: "\u2194",
        harrcir: "\u2948",
        harrw: "\u21AD",
        Hat: "^",
        hbar: "\u210F",
        Hcirc: "\u0124",
        hcirc: "\u0125",
        hearts: "\u2665",
        heartsuit: "\u2665",
        hellip: "\u2026",
        hercon: "\u22B9",
        Hfr: "\u210C",
        hfr: "\u{1D525}",
        HilbertSpace: "\u210B",
        hksearow: "\u2925",
        hkswarow: "\u2926",
        hoarr: "\u21FF",
        homtht: "\u223B",
        hookleftarrow: "\u21A9",
        hookrightarrow: "\u21AA",
        Hopf: "\u210D",
        hopf: "\u{1D559}",
        horbar: "\u2015",
        HorizontalLine: "\u2500",
        Hscr: "\u210B",
        hscr: "\u{1D4BD}",
        hslash: "\u210F",
        Hstrok: "\u0126",
        hstrok: "\u0127",
        HumpDownHump: "\u224E",
        HumpEqual: "\u224F",
        hybull: "\u2043",
        hyphen: "\u2010",
        Iacute: "\xCD",
        iacute: "\xED",
        ic: "\u2063",
        Icirc: "\xCE",
        icirc: "\xEE",
        Icy: "\u0418",
        icy: "\u0438",
        Idot: "\u0130",
        IEcy: "\u0415",
        iecy: "\u0435",
        iexcl: "\xA1",
        iff: "\u21D4",
        Ifr: "\u2111",
        ifr: "\u{1D526}",
        Igrave: "\xCC",
        igrave: "\xEC",
        ii: "\u2148",
        iiiint: "\u2A0C",
        iiint: "\u222D",
        iinfin: "\u29DC",
        iiota: "\u2129",
        IJlig: "\u0132",
        ijlig: "\u0133",
        Im: "\u2111",
        Imacr: "\u012A",
        imacr: "\u012B",
        image: "\u2111",
        ImaginaryI: "\u2148",
        imagline: "\u2110",
        imagpart: "\u2111",
        imath: "\u0131",
        imof: "\u22B7",
        imped: "\u01B5",
        Implies: "\u21D2",
        in: "\u2208",
        incare: "\u2105",
        infin: "\u221E",
        infintie: "\u29DD",
        inodot: "\u0131",
        Int: "\u222C",
        int: "\u222B",
        intcal: "\u22BA",
        integers: "\u2124",
        Integral: "\u222B",
        intercal: "\u22BA",
        Intersection: "\u22C2",
        intlarhk: "\u2A17",
        intprod: "\u2A3C",
        InvisibleComma: "\u2063",
        InvisibleTimes: "\u2062",
        IOcy: "\u0401",
        iocy: "\u0451",
        Iogon: "\u012E",
        iogon: "\u012F",
        Iopf: "\u{1D540}",
        iopf: "\u{1D55A}",
        Iota: "\u0399",
        iota: "\u03B9",
        iprod: "\u2A3C",
        iquest: "\xBF",
        Iscr: "\u2110",
        iscr: "\u{1D4BE}",
        isin: "\u2208",
        isindot: "\u22F5",
        isinE: "\u22F9",
        isins: "\u22F4",
        isinsv: "\u22F3",
        isinv: "\u2208",
        it: "\u2062",
        Itilde: "\u0128",
        itilde: "\u0129",
        Iukcy: "\u0406",
        iukcy: "\u0456",
        Iuml: "\xCF",
        iuml: "\xEF",
        Jcirc: "\u0134",
        jcirc: "\u0135",
        Jcy: "\u0419",
        jcy: "\u0439",
        Jfr: "\u{1D50D}",
        jfr: "\u{1D527}",
        jmath: "\u0237",
        Jopf: "\u{1D541}",
        jopf: "\u{1D55B}",
        Jscr: "\u{1D4A5}",
        jscr: "\u{1D4BF}",
        Jsercy: "\u0408",
        jsercy: "\u0458",
        Jukcy: "\u0404",
        jukcy: "\u0454",
        Kappa: "\u039A",
        kappa: "\u03BA",
        kappav: "\u03F0",
        Kcedil: "\u0136",
        kcedil: "\u0137",
        Kcy: "\u041A",
        kcy: "\u043A",
        Kfr: "\u{1D50E}",
        kfr: "\u{1D528}",
        kgreen: "\u0138",
        KHcy: "\u0425",
        khcy: "\u0445",
        KJcy: "\u040C",
        kjcy: "\u045C",
        Kopf: "\u{1D542}",
        kopf: "\u{1D55C}",
        Kscr: "\u{1D4A6}",
        kscr: "\u{1D4C0}",
        lAarr: "\u21DA",
        Lacute: "\u0139",
        lacute: "\u013A",
        laemptyv: "\u29B4",
        lagran: "\u2112",
        Lambda: "\u039B",
        lambda: "\u03BB",
        Lang: "\u27EA",
        lang: "\u27E8",
        langd: "\u2991",
        langle: "\u27E8",
        lap: "\u2A85",
        Laplacetrf: "\u2112",
        laquo: "\xAB",
        Larr: "\u219E",
        lArr: "\u21D0",
        larr: "\u2190",
        larrb: "\u21E4",
        larrbfs: "\u291F",
        larrfs: "\u291D",
        larrhk: "\u21A9",
        larrlp: "\u21AB",
        larrpl: "\u2939",
        larrsim: "\u2973",
        larrtl: "\u21A2",
        lat: "\u2AAB",
        lAtail: "\u291B",
        latail: "\u2919",
        late: "\u2AAD",
        lates: "\u2AAD\uFE00",
        lBarr: "\u290E",
        lbarr: "\u290C",
        lbbrk: "\u2772",
        lbrace: "{",
        lbrack: "[",
        lbrke: "\u298B",
        lbrksld: "\u298F",
        lbrkslu: "\u298D",
        Lcaron: "\u013D",
        lcaron: "\u013E",
        Lcedil: "\u013B",
        lcedil: "\u013C",
        lceil: "\u2308",
        lcub: "{",
        Lcy: "\u041B",
        lcy: "\u043B",
        ldca: "\u2936",
        ldquo: "\u201C",
        ldquor: "\u201E",
        ldrdhar: "\u2967",
        ldrushar: "\u294B",
        ldsh: "\u21B2",
        lE: "\u2266",
        le: "\u2264",
        LeftAngleBracket: "\u27E8",
        LeftArrow: "\u2190",
        Leftarrow: "\u21D0",
        leftarrow: "\u2190",
        LeftArrowBar: "\u21E4",
        LeftArrowRightArrow: "\u21C6",
        leftarrowtail: "\u21A2",
        LeftCeiling: "\u2308",
        LeftDoubleBracket: "\u27E6",
        LeftDownTeeVector: "\u2961",
        LeftDownVector: "\u21C3",
        LeftDownVectorBar: "\u2959",
        LeftFloor: "\u230A",
        leftharpoondown: "\u21BD",
        leftharpoonup: "\u21BC",
        leftleftarrows: "\u21C7",
        LeftRightArrow: "\u2194",
        Leftrightarrow: "\u21D4",
        leftrightarrow: "\u2194",
        leftrightarrows: "\u21C6",
        leftrightharpoons: "\u21CB",
        leftrightsquigarrow: "\u21AD",
        LeftRightVector: "\u294E",
        LeftTee: "\u22A3",
        LeftTeeArrow: "\u21A4",
        LeftTeeVector: "\u295A",
        leftthreetimes: "\u22CB",
        LeftTriangle: "\u22B2",
        LeftTriangleBar: "\u29CF",
        LeftTriangleEqual: "\u22B4",
        LeftUpDownVector: "\u2951",
        LeftUpTeeVector: "\u2960",
        LeftUpVector: "\u21BF",
        LeftUpVectorBar: "\u2958",
        LeftVector: "\u21BC",
        LeftVectorBar: "\u2952",
        lEg: "\u2A8B",
        leg: "\u22DA",
        leq: "\u2264",
        leqq: "\u2266",
        leqslant: "\u2A7D",
        les: "\u2A7D",
        lescc: "\u2AA8",
        lesdot: "\u2A7F",
        lesdoto: "\u2A81",
        lesdotor: "\u2A83",
        lesg: "\u22DA\uFE00",
        lesges: "\u2A93",
        lessapprox: "\u2A85",
        lessdot: "\u22D6",
        lesseqgtr: "\u22DA",
        lesseqqgtr: "\u2A8B",
        LessEqualGreater: "\u22DA",
        LessFullEqual: "\u2266",
        LessGreater: "\u2276",
        lessgtr: "\u2276",
        LessLess: "\u2AA1",
        lesssim: "\u2272",
        LessSlantEqual: "\u2A7D",
        LessTilde: "\u2272",
        lfisht: "\u297C",
        lfloor: "\u230A",
        Lfr: "\u{1D50F}",
        lfr: "\u{1D529}",
        lg: "\u2276",
        lgE: "\u2A91",
        lHar: "\u2962",
        lhard: "\u21BD",
        lharu: "\u21BC",
        lharul: "\u296A",
        lhblk: "\u2584",
        LJcy: "\u0409",
        ljcy: "\u0459",
        Ll: "\u22D8",
        ll: "\u226A",
        llarr: "\u21C7",
        llcorner: "\u231E",
        Lleftarrow: "\u21DA",
        llhard: "\u296B",
        lltri: "\u25FA",
        Lmidot: "\u013F",
        lmidot: "\u0140",
        lmoust: "\u23B0",
        lmoustache: "\u23B0",
        lnap: "\u2A89",
        lnapprox: "\u2A89",
        lnE: "\u2268",
        lne: "\u2A87",
        lneq: "\u2A87",
        lneqq: "\u2268",
        lnsim: "\u22E6",
        loang: "\u27EC",
        loarr: "\u21FD",
        lobrk: "\u27E6",
        LongLeftArrow: "\u27F5",
        Longleftarrow: "\u27F8",
        longleftarrow: "\u27F5",
        LongLeftRightArrow: "\u27F7",
        Longleftrightarrow: "\u27FA",
        longleftrightarrow: "\u27F7",
        longmapsto: "\u27FC",
        LongRightArrow: "\u27F6",
        Longrightarrow: "\u27F9",
        longrightarrow: "\u27F6",
        looparrowleft: "\u21AB",
        looparrowright: "\u21AC",
        lopar: "\u2985",
        Lopf: "\u{1D543}",
        lopf: "\u{1D55D}",
        loplus: "\u2A2D",
        lotimes: "\u2A34",
        lowast: "\u2217",
        lowbar: "_",
        LowerLeftArrow: "\u2199",
        LowerRightArrow: "\u2198",
        loz: "\u25CA",
        lozenge: "\u25CA",
        lozf: "\u29EB",
        lpar: "(",
        lparlt: "\u2993",
        lrarr: "\u21C6",
        lrcorner: "\u231F",
        lrhar: "\u21CB",
        lrhard: "\u296D",
        lrm: "\u200E",
        lrtri: "\u22BF",
        lsaquo: "\u2039",
        Lscr: "\u2112",
        lscr: "\u{1D4C1}",
        Lsh: "\u21B0",
        lsh: "\u21B0",
        lsim: "\u2272",
        lsime: "\u2A8D",
        lsimg: "\u2A8F",
        lsqb: "[",
        lsquo: "\u2018",
        lsquor: "\u201A",
        Lstrok: "\u0141",
        lstrok: "\u0142",
        Lt: "\u226A",
        LT: "<",
        lt: "<",
        ltcc: "\u2AA6",
        ltcir: "\u2A79",
        ltdot: "\u22D6",
        lthree: "\u22CB",
        ltimes: "\u22C9",
        ltlarr: "\u2976",
        ltquest: "\u2A7B",
        ltri: "\u25C3",
        ltrie: "\u22B4",
        ltrif: "\u25C2",
        ltrPar: "\u2996",
        lurdshar: "\u294A",
        luruhar: "\u2966",
        lvertneqq: "\u2268\uFE00",
        lvnE: "\u2268\uFE00",
        macr: "\xAF",
        male: "\u2642",
        malt: "\u2720",
        maltese: "\u2720",
        Map: "\u2905",
        map: "\u21A6",
        mapsto: "\u21A6",
        mapstodown: "\u21A7",
        mapstoleft: "\u21A4",
        mapstoup: "\u21A5",
        marker: "\u25AE",
        mcomma: "\u2A29",
        Mcy: "\u041C",
        mcy: "\u043C",
        mdash: "\u2014",
        mDDot: "\u223A",
        measuredangle: "\u2221",
        MediumSpace: "\u205F",
        Mellintrf: "\u2133",
        Mfr: "\u{1D510}",
        mfr: "\u{1D52A}",
        mho: "\u2127",
        micro: "\xB5",
        mid: "\u2223",
        midast: "*",
        midcir: "\u2AF0",
        middot: "\xB7",
        minus: "\u2212",
        minusb: "\u229F",
        minusd: "\u2238",
        minusdu: "\u2A2A",
        MinusPlus: "\u2213",
        mlcp: "\u2ADB",
        mldr: "\u2026",
        mnplus: "\u2213",
        models: "\u22A7",
        Mopf: "\u{1D544}",
        mopf: "\u{1D55E}",
        mp: "\u2213",
        Mscr: "\u2133",
        mscr: "\u{1D4C2}",
        mstpos: "\u223E",
        Mu: "\u039C",
        mu: "\u03BC",
        multimap: "\u22B8",
        mumap: "\u22B8",
        nabla: "\u2207",
        Nacute: "\u0143",
        nacute: "\u0144",
        nang: "\u2220\u20D2",
        nap: "\u2249",
        napE: "\u2A70\u0338",
        napid: "\u224B\u0338",
        napos: "\u0149",
        napprox: "\u2249",
        natur: "\u266E",
        natural: "\u266E",
        naturals: "\u2115",
        nbsp: "\xA0",
        nbump: "\u224E\u0338",
        nbumpe: "\u224F\u0338",
        ncap: "\u2A43",
        Ncaron: "\u0147",
        ncaron: "\u0148",
        Ncedil: "\u0145",
        ncedil: "\u0146",
        ncong: "\u2247",
        ncongdot: "\u2A6D\u0338",
        ncup: "\u2A42",
        Ncy: "\u041D",
        ncy: "\u043D",
        ndash: "\u2013",
        ne: "\u2260",
        nearhk: "\u2924",
        neArr: "\u21D7",
        nearr: "\u2197",
        nearrow: "\u2197",
        nedot: "\u2250\u0338",
        NegativeMediumSpace: "\u200B",
        NegativeThickSpace: "\u200B",
        NegativeThinSpace: "\u200B",
        NegativeVeryThinSpace: "\u200B",
        nequiv: "\u2262",
        nesear: "\u2928",
        nesim: "\u2242\u0338",
        NestedGreaterGreater: "\u226B",
        NestedLessLess: "\u226A",
        NewLine: "\n",
        nexist: "\u2204",
        nexists: "\u2204",
        Nfr: "\u{1D511}",
        nfr: "\u{1D52B}",
        ngE: "\u2267\u0338",
        nge: "\u2271",
        ngeq: "\u2271",
        ngeqq: "\u2267\u0338",
        ngeqslant: "\u2A7E\u0338",
        nges: "\u2A7E\u0338",
        nGg: "\u22D9\u0338",
        ngsim: "\u2275",
        nGt: "\u226B\u20D2",
        ngt: "\u226F",
        ngtr: "\u226F",
        nGtv: "\u226B\u0338",
        nhArr: "\u21CE",
        nharr: "\u21AE",
        nhpar: "\u2AF2",
        ni: "\u220B",
        nis: "\u22FC",
        nisd: "\u22FA",
        niv: "\u220B",
        NJcy: "\u040A",
        njcy: "\u045A",
        nlArr: "\u21CD",
        nlarr: "\u219A",
        nldr: "\u2025",
        nlE: "\u2266\u0338",
        nle: "\u2270",
        nLeftarrow: "\u21CD",
        nleftarrow: "\u219A",
        nLeftrightarrow: "\u21CE",
        nleftrightarrow: "\u21AE",
        nleq: "\u2270",
        nleqq: "\u2266\u0338",
        nleqslant: "\u2A7D\u0338",
        nles: "\u2A7D\u0338",
        nless: "\u226E",
        nLl: "\u22D8\u0338",
        nlsim: "\u2274",
        nLt: "\u226A\u20D2",
        nlt: "\u226E",
        nltri: "\u22EA",
        nltrie: "\u22EC",
        nLtv: "\u226A\u0338",
        nmid: "\u2224",
        NoBreak: "\u2060",
        NonBreakingSpace: "\xA0",
        Nopf: "\u2115",
        nopf: "\u{1D55F}",
        Not: "\u2AEC",
        not: "\xAC",
        NotCongruent: "\u2262",
        NotCupCap: "\u226D",
        NotDoubleVerticalBar: "\u2226",
        NotElement: "\u2209",
        NotEqual: "\u2260",
        NotEqualTilde: "\u2242\u0338",
        NotExists: "\u2204",
        NotGreater: "\u226F",
        NotGreaterEqual: "\u2271",
        NotGreaterFullEqual: "\u2267\u0338",
        NotGreaterGreater: "\u226B\u0338",
        NotGreaterLess: "\u2279",
        NotGreaterSlantEqual: "\u2A7E\u0338",
        NotGreaterTilde: "\u2275",
        NotHumpDownHump: "\u224E\u0338",
        NotHumpEqual: "\u224F\u0338",
        notin: "\u2209",
        notindot: "\u22F5\u0338",
        notinE: "\u22F9\u0338",
        notinva: "\u2209",
        notinvb: "\u22F7",
        notinvc: "\u22F6",
        NotLeftTriangle: "\u22EA",
        NotLeftTriangleBar: "\u29CF\u0338",
        NotLeftTriangleEqual: "\u22EC",
        NotLess: "\u226E",
        NotLessEqual: "\u2270",
        NotLessGreater: "\u2278",
        NotLessLess: "\u226A\u0338",
        NotLessSlantEqual: "\u2A7D\u0338",
        NotLessTilde: "\u2274",
        NotNestedGreaterGreater: "\u2AA2\u0338",
        NotNestedLessLess: "\u2AA1\u0338",
        notni: "\u220C",
        notniva: "\u220C",
        notnivb: "\u22FE",
        notnivc: "\u22FD",
        NotPrecedes: "\u2280",
        NotPrecedesEqual: "\u2AAF\u0338",
        NotPrecedesSlantEqual: "\u22E0",
        NotReverseElement: "\u220C",
        NotRightTriangle: "\u22EB",
        NotRightTriangleBar: "\u29D0\u0338",
        NotRightTriangleEqual: "\u22ED",
        NotSquareSubset: "\u228F\u0338",
        NotSquareSubsetEqual: "\u22E2",
        NotSquareSuperset: "\u2290\u0338",
        NotSquareSupersetEqual: "\u22E3",
        NotSubset: "\u2282\u20D2",
        NotSubsetEqual: "\u2288",
        NotSucceeds: "\u2281",
        NotSucceedsEqual: "\u2AB0\u0338",
        NotSucceedsSlantEqual: "\u22E1",
        NotSucceedsTilde: "\u227F\u0338",
        NotSuperset: "\u2283\u20D2",
        NotSupersetEqual: "\u2289",
        NotTilde: "\u2241",
        NotTildeEqual: "\u2244",
        NotTildeFullEqual: "\u2247",
        NotTildeTilde: "\u2249",
        NotVerticalBar: "\u2224",
        npar: "\u2226",
        nparallel: "\u2226",
        nparsl: "\u2AFD\u20E5",
        npart: "\u2202\u0338",
        npolint: "\u2A14",
        npr: "\u2280",
        nprcue: "\u22E0",
        npre: "\u2AAF\u0338",
        nprec: "\u2280",
        npreceq: "\u2AAF\u0338",
        nrArr: "\u21CF",
        nrarr: "\u219B",
        nrarrc: "\u2933\u0338",
        nrarrw: "\u219D\u0338",
        nRightarrow: "\u21CF",
        nrightarrow: "\u219B",
        nrtri: "\u22EB",
        nrtrie: "\u22ED",
        nsc: "\u2281",
        nsccue: "\u22E1",
        nsce: "\u2AB0\u0338",
        Nscr: "\u{1D4A9}",
        nscr: "\u{1D4C3}",
        nshortmid: "\u2224",
        nshortparallel: "\u2226",
        nsim: "\u2241",
        nsime: "\u2244",
        nsimeq: "\u2244",
        nsmid: "\u2224",
        nspar: "\u2226",
        nsqsube: "\u22E2",
        nsqsupe: "\u22E3",
        nsub: "\u2284",
        nsubE: "\u2AC5\u0338",
        nsube: "\u2288",
        nsubset: "\u2282\u20D2",
        nsubseteq: "\u2288",
        nsubseteqq: "\u2AC5\u0338",
        nsucc: "\u2281",
        nsucceq: "\u2AB0\u0338",
        nsup: "\u2285",
        nsupE: "\u2AC6\u0338",
        nsupe: "\u2289",
        nsupset: "\u2283\u20D2",
        nsupseteq: "\u2289",
        nsupseteqq: "\u2AC6\u0338",
        ntgl: "\u2279",
        Ntilde: "\xD1",
        ntilde: "\xF1",
        ntlg: "\u2278",
        ntriangleleft: "\u22EA",
        ntrianglelefteq: "\u22EC",
        ntriangleright: "\u22EB",
        ntrianglerighteq: "\u22ED",
        Nu: "\u039D",
        nu: "\u03BD",
        num: "#",
        numero: "\u2116",
        numsp: "\u2007",
        nvap: "\u224D\u20D2",
        nVDash: "\u22AF",
        nVdash: "\u22AE",
        nvDash: "\u22AD",
        nvdash: "\u22AC",
        nvge: "\u2265\u20D2",
        nvgt: ">\u20D2",
        nvHarr: "\u2904",
        nvinfin: "\u29DE",
        nvlArr: "\u2902",
        nvle: "\u2264\u20D2",
        nvlt: "<\u20D2",
        nvltrie: "\u22B4\u20D2",
        nvrArr: "\u2903",
        nvrtrie: "\u22B5\u20D2",
        nvsim: "\u223C\u20D2",
        nwarhk: "\u2923",
        nwArr: "\u21D6",
        nwarr: "\u2196",
        nwarrow: "\u2196",
        nwnear: "\u2927",
        Oacute: "\xD3",
        oacute: "\xF3",
        oast: "\u229B",
        ocir: "\u229A",
        Ocirc: "\xD4",
        ocirc: "\xF4",
        Ocy: "\u041E",
        ocy: "\u043E",
        odash: "\u229D",
        Odblac: "\u0150",
        odblac: "\u0151",
        odiv: "\u2A38",
        odot: "\u2299",
        odsold: "\u29BC",
        OElig: "\u0152",
        oelig: "\u0153",
        ofcir: "\u29BF",
        Ofr: "\u{1D512}",
        ofr: "\u{1D52C}",
        ogon: "\u02DB",
        Ograve: "\xD2",
        ograve: "\xF2",
        ogt: "\u29C1",
        ohbar: "\u29B5",
        ohm: "\u03A9",
        oint: "\u222E",
        olarr: "\u21BA",
        olcir: "\u29BE",
        olcross: "\u29BB",
        oline: "\u203E",
        olt: "\u29C0",
        Omacr: "\u014C",
        omacr: "\u014D",
        Omega: "\u03A9",
        omega: "\u03C9",
        Omicron: "\u039F",
        omicron: "\u03BF",
        omid: "\u29B6",
        ominus: "\u2296",
        Oopf: "\u{1D546}",
        oopf: "\u{1D560}",
        opar: "\u29B7",
        OpenCurlyDoubleQuote: "\u201C",
        OpenCurlyQuote: "\u2018",
        operp: "\u29B9",
        oplus: "\u2295",
        Or: "\u2A54",
        or: "\u2228",
        orarr: "\u21BB",
        ord: "\u2A5D",
        order: "\u2134",
        orderof: "\u2134",
        ordf: "\xAA",
        ordm: "\xBA",
        origof: "\u22B6",
        oror: "\u2A56",
        orslope: "\u2A57",
        orv: "\u2A5B",
        oS: "\u24C8",
        Oscr: "\u{1D4AA}",
        oscr: "\u2134",
        Oslash: "\xD8",
        oslash: "\xF8",
        osol: "\u2298",
        Otilde: "\xD5",
        otilde: "\xF5",
        Otimes: "\u2A37",
        otimes: "\u2297",
        otimesas: "\u2A36",
        Ouml: "\xD6",
        ouml: "\xF6",
        ovbar: "\u233D",
        OverBar: "\u203E",
        OverBrace: "\u23DE",
        OverBracket: "\u23B4",
        OverParenthesis: "\u23DC",
        par: "\u2225",
        para: "\xB6",
        parallel: "\u2225",
        parsim: "\u2AF3",
        parsl: "\u2AFD",
        part: "\u2202",
        PartialD: "\u2202",
        Pcy: "\u041F",
        pcy: "\u043F",
        percnt: "%",
        period: ".",
        permil: "\u2030",
        perp: "\u22A5",
        pertenk: "\u2031",
        Pfr: "\u{1D513}",
        pfr: "\u{1D52D}",
        Phi: "\u03A6",
        phi: "\u03C6",
        phiv: "\u03D5",
        phmmat: "\u2133",
        phone: "\u260E",
        Pi: "\u03A0",
        pi: "\u03C0",
        pitchfork: "\u22D4",
        piv: "\u03D6",
        planck: "\u210F",
        planckh: "\u210E",
        plankv: "\u210F",
        plus: "+",
        plusacir: "\u2A23",
        plusb: "\u229E",
        pluscir: "\u2A22",
        plusdo: "\u2214",
        plusdu: "\u2A25",
        pluse: "\u2A72",
        PlusMinus: "\xB1",
        plusmn: "\xB1",
        plussim: "\u2A26",
        plustwo: "\u2A27",
        pm: "\xB1",
        Poincareplane: "\u210C",
        pointint: "\u2A15",
        Popf: "\u2119",
        popf: "\u{1D561}",
        pound: "\xA3",
        Pr: "\u2ABB",
        pr: "\u227A",
        prap: "\u2AB7",
        prcue: "\u227C",
        prE: "\u2AB3",
        pre: "\u2AAF",
        prec: "\u227A",
        precapprox: "\u2AB7",
        preccurlyeq: "\u227C",
        Precedes: "\u227A",
        PrecedesEqual: "\u2AAF",
        PrecedesSlantEqual: "\u227C",
        PrecedesTilde: "\u227E",
        preceq: "\u2AAF",
        precnapprox: "\u2AB9",
        precneqq: "\u2AB5",
        precnsim: "\u22E8",
        precsim: "\u227E",
        Prime: "\u2033",
        prime: "\u2032",
        primes: "\u2119",
        prnap: "\u2AB9",
        prnE: "\u2AB5",
        prnsim: "\u22E8",
        prod: "\u220F",
        Product: "\u220F",
        profalar: "\u232E",
        profline: "\u2312",
        profsurf: "\u2313",
        prop: "\u221D",
        Proportion: "\u2237",
        Proportional: "\u221D",
        propto: "\u221D",
        prsim: "\u227E",
        prurel: "\u22B0",
        Pscr: "\u{1D4AB}",
        pscr: "\u{1D4C5}",
        Psi: "\u03A8",
        psi: "\u03C8",
        puncsp: "\u2008",
        Qfr: "\u{1D514}",
        qfr: "\u{1D52E}",
        qint: "\u2A0C",
        Qopf: "\u211A",
        qopf: "\u{1D562}",
        qprime: "\u2057",
        Qscr: "\u{1D4AC}",
        qscr: "\u{1D4C6}",
        quaternions: "\u210D",
        quatint: "\u2A16",
        quest: "?",
        questeq: "\u225F",
        QUOT: '"',
        quot: '"',
        rAarr: "\u21DB",
        race: "\u223D\u0331",
        Racute: "\u0154",
        racute: "\u0155",
        radic: "\u221A",
        raemptyv: "\u29B3",
        Rang: "\u27EB",
        rang: "\u27E9",
        rangd: "\u2992",
        range: "\u29A5",
        rangle: "\u27E9",
        raquo: "\xBB",
        Rarr: "\u21A0",
        rArr: "\u21D2",
        rarr: "\u2192",
        rarrap: "\u2975",
        rarrb: "\u21E5",
        rarrbfs: "\u2920",
        rarrc: "\u2933",
        rarrfs: "\u291E",
        rarrhk: "\u21AA",
        rarrlp: "\u21AC",
        rarrpl: "\u2945",
        rarrsim: "\u2974",
        Rarrtl: "\u2916",
        rarrtl: "\u21A3",
        rarrw: "\u219D",
        rAtail: "\u291C",
        ratail: "\u291A",
        ratio: "\u2236",
        rationals: "\u211A",
        RBarr: "\u2910",
        rBarr: "\u290F",
        rbarr: "\u290D",
        rbbrk: "\u2773",
        rbrace: "}",
        rbrack: "]",
        rbrke: "\u298C",
        rbrksld: "\u298E",
        rbrkslu: "\u2990",
        Rcaron: "\u0158",
        rcaron: "\u0159",
        Rcedil: "\u0156",
        rcedil: "\u0157",
        rceil: "\u2309",
        rcub: "}",
        Rcy: "\u0420",
        rcy: "\u0440",
        rdca: "\u2937",
        rdldhar: "\u2969",
        rdquo: "\u201D",
        rdquor: "\u201D",
        rdsh: "\u21B3",
        Re: "\u211C",
        real: "\u211C",
        realine: "\u211B",
        realpart: "\u211C",
        reals: "\u211D",
        rect: "\u25AD",
        REG: "\xAE",
        reg: "\xAE",
        ReverseElement: "\u220B",
        ReverseEquilibrium: "\u21CB",
        ReverseUpEquilibrium: "\u296F",
        rfisht: "\u297D",
        rfloor: "\u230B",
        Rfr: "\u211C",
        rfr: "\u{1D52F}",
        rHar: "\u2964",
        rhard: "\u21C1",
        rharu: "\u21C0",
        rharul: "\u296C",
        Rho: "\u03A1",
        rho: "\u03C1",
        rhov: "\u03F1",
        RightAngleBracket: "\u27E9",
        RightArrow: "\u2192",
        Rightarrow: "\u21D2",
        rightarrow: "\u2192",
        RightArrowBar: "\u21E5",
        RightArrowLeftArrow: "\u21C4",
        rightarrowtail: "\u21A3",
        RightCeiling: "\u2309",
        RightDoubleBracket: "\u27E7",
        RightDownTeeVector: "\u295D",
        RightDownVector: "\u21C2",
        RightDownVectorBar: "\u2955",
        RightFloor: "\u230B",
        rightharpoondown: "\u21C1",
        rightharpoonup: "\u21C0",
        rightleftarrows: "\u21C4",
        rightleftharpoons: "\u21CC",
        rightrightarrows: "\u21C9",
        rightsquigarrow: "\u219D",
        RightTee: "\u22A2",
        RightTeeArrow: "\u21A6",
        RightTeeVector: "\u295B",
        rightthreetimes: "\u22CC",
        RightTriangle: "\u22B3",
        RightTriangleBar: "\u29D0",
        RightTriangleEqual: "\u22B5",
        RightUpDownVector: "\u294F",
        RightUpTeeVector: "\u295C",
        RightUpVector: "\u21BE",
        RightUpVectorBar: "\u2954",
        RightVector: "\u21C0",
        RightVectorBar: "\u2953",
        ring: "\u02DA",
        risingdotseq: "\u2253",
        rlarr: "\u21C4",
        rlhar: "\u21CC",
        rlm: "\u200F",
        rmoust: "\u23B1",
        rmoustache: "\u23B1",
        rnmid: "\u2AEE",
        roang: "\u27ED",
        roarr: "\u21FE",
        robrk: "\u27E7",
        ropar: "\u2986",
        Ropf: "\u211D",
        ropf: "\u{1D563}",
        roplus: "\u2A2E",
        rotimes: "\u2A35",
        RoundImplies: "\u2970",
        rpar: ")",
        rpargt: "\u2994",
        rppolint: "\u2A12",
        rrarr: "\u21C9",
        Rrightarrow: "\u21DB",
        rsaquo: "\u203A",
        Rscr: "\u211B",
        rscr: "\u{1D4C7}",
        Rsh: "\u21B1",
        rsh: "\u21B1",
        rsqb: "]",
        rsquo: "\u2019",
        rsquor: "\u2019",
        rthree: "\u22CC",
        rtimes: "\u22CA",
        rtri: "\u25B9",
        rtrie: "\u22B5",
        rtrif: "\u25B8",
        rtriltri: "\u29CE",
        RuleDelayed: "\u29F4",
        ruluhar: "\u2968",
        rx: "\u211E",
        Sacute: "\u015A",
        sacute: "\u015B",
        sbquo: "\u201A",
        Sc: "\u2ABC",
        sc: "\u227B",
        scap: "\u2AB8",
        Scaron: "\u0160",
        scaron: "\u0161",
        sccue: "\u227D",
        scE: "\u2AB4",
        sce: "\u2AB0",
        Scedil: "\u015E",
        scedil: "\u015F",
        Scirc: "\u015C",
        scirc: "\u015D",
        scnap: "\u2ABA",
        scnE: "\u2AB6",
        scnsim: "\u22E9",
        scpolint: "\u2A13",
        scsim: "\u227F",
        Scy: "\u0421",
        scy: "\u0441",
        sdot: "\u22C5",
        sdotb: "\u22A1",
        sdote: "\u2A66",
        searhk: "\u2925",
        seArr: "\u21D8",
        searr: "\u2198",
        searrow: "\u2198",
        sect: "\xA7",
        semi: ";",
        seswar: "\u2929",
        setminus: "\u2216",
        setmn: "\u2216",
        sext: "\u2736",
        Sfr: "\u{1D516}",
        sfr: "\u{1D530}",
        sfrown: "\u2322",
        sharp: "\u266F",
        SHCHcy: "\u0429",
        shchcy: "\u0449",
        SHcy: "\u0428",
        shcy: "\u0448",
        ShortDownArrow: "\u2193",
        ShortLeftArrow: "\u2190",
        shortmid: "\u2223",
        shortparallel: "\u2225",
        ShortRightArrow: "\u2192",
        ShortUpArrow: "\u2191",
        shy: "\xAD",
        Sigma: "\u03A3",
        sigma: "\u03C3",
        sigmaf: "\u03C2",
        sigmav: "\u03C2",
        sim: "\u223C",
        simdot: "\u2A6A",
        sime: "\u2243",
        simeq: "\u2243",
        simg: "\u2A9E",
        simgE: "\u2AA0",
        siml: "\u2A9D",
        simlE: "\u2A9F",
        simne: "\u2246",
        simplus: "\u2A24",
        simrarr: "\u2972",
        slarr: "\u2190",
        SmallCircle: "\u2218",
        smallsetminus: "\u2216",
        smashp: "\u2A33",
        smeparsl: "\u29E4",
        smid: "\u2223",
        smile: "\u2323",
        smt: "\u2AAA",
        smte: "\u2AAC",
        smtes: "\u2AAC\uFE00",
        SOFTcy: "\u042C",
        softcy: "\u044C",
        sol: "/",
        solb: "\u29C4",
        solbar: "\u233F",
        Sopf: "\u{1D54A}",
        sopf: "\u{1D564}",
        spades: "\u2660",
        spadesuit: "\u2660",
        spar: "\u2225",
        sqcap: "\u2293",
        sqcaps: "\u2293\uFE00",
        sqcup: "\u2294",
        sqcups: "\u2294\uFE00",
        Sqrt: "\u221A",
        sqsub: "\u228F",
        sqsube: "\u2291",
        sqsubset: "\u228F",
        sqsubseteq: "\u2291",
        sqsup: "\u2290",
        sqsupe: "\u2292",
        sqsupset: "\u2290",
        sqsupseteq: "\u2292",
        squ: "\u25A1",
        Square: "\u25A1",
        square: "\u25A1",
        SquareIntersection: "\u2293",
        SquareSubset: "\u228F",
        SquareSubsetEqual: "\u2291",
        SquareSuperset: "\u2290",
        SquareSupersetEqual: "\u2292",
        SquareUnion: "\u2294",
        squarf: "\u25AA",
        squf: "\u25AA",
        srarr: "\u2192",
        Sscr: "\u{1D4AE}",
        sscr: "\u{1D4C8}",
        ssetmn: "\u2216",
        ssmile: "\u2323",
        sstarf: "\u22C6",
        Star: "\u22C6",
        star: "\u2606",
        starf: "\u2605",
        straightepsilon: "\u03F5",
        straightphi: "\u03D5",
        strns: "\xAF",
        Sub: "\u22D0",
        sub: "\u2282",
        subdot: "\u2ABD",
        subE: "\u2AC5",
        sube: "\u2286",
        subedot: "\u2AC3",
        submult: "\u2AC1",
        subnE: "\u2ACB",
        subne: "\u228A",
        subplus: "\u2ABF",
        subrarr: "\u2979",
        Subset: "\u22D0",
        subset: "\u2282",
        subseteq: "\u2286",
        subseteqq: "\u2AC5",
        SubsetEqual: "\u2286",
        subsetneq: "\u228A",
        subsetneqq: "\u2ACB",
        subsim: "\u2AC7",
        subsub: "\u2AD5",
        subsup: "\u2AD3",
        succ: "\u227B",
        succapprox: "\u2AB8",
        succcurlyeq: "\u227D",
        Succeeds: "\u227B",
        SucceedsEqual: "\u2AB0",
        SucceedsSlantEqual: "\u227D",
        SucceedsTilde: "\u227F",
        succeq: "\u2AB0",
        succnapprox: "\u2ABA",
        succneqq: "\u2AB6",
        succnsim: "\u22E9",
        succsim: "\u227F",
        SuchThat: "\u220B",
        Sum: "\u2211",
        sum: "\u2211",
        sung: "\u266A",
        Sup: "\u22D1",
        sup: "\u2283",
        sup1: "\xB9",
        sup2: "\xB2",
        sup3: "\xB3",
        supdot: "\u2ABE",
        supdsub: "\u2AD8",
        supE: "\u2AC6",
        supe: "\u2287",
        supedot: "\u2AC4",
        Superset: "\u2283",
        SupersetEqual: "\u2287",
        suphsol: "\u27C9",
        suphsub: "\u2AD7",
        suplarr: "\u297B",
        supmult: "\u2AC2",
        supnE: "\u2ACC",
        supne: "\u228B",
        supplus: "\u2AC0",
        Supset: "\u22D1",
        supset: "\u2283",
        supseteq: "\u2287",
        supseteqq: "\u2AC6",
        supsetneq: "\u228B",
        supsetneqq: "\u2ACC",
        supsim: "\u2AC8",
        supsub: "\u2AD4",
        supsup: "\u2AD6",
        swarhk: "\u2926",
        swArr: "\u21D9",
        swarr: "\u2199",
        swarrow: "\u2199",
        swnwar: "\u292A",
        szlig: "\xDF",
        Tab: "	",
        target: "\u2316",
        Tau: "\u03A4",
        tau: "\u03C4",
        tbrk: "\u23B4",
        Tcaron: "\u0164",
        tcaron: "\u0165",
        Tcedil: "\u0162",
        tcedil: "\u0163",
        Tcy: "\u0422",
        tcy: "\u0442",
        tdot: "\u20DB",
        telrec: "\u2315",
        Tfr: "\u{1D517}",
        tfr: "\u{1D531}",
        there4: "\u2234",
        Therefore: "\u2234",
        therefore: "\u2234",
        Theta: "\u0398",
        theta: "\u03B8",
        thetasym: "\u03D1",
        thetav: "\u03D1",
        thickapprox: "\u2248",
        thicksim: "\u223C",
        ThickSpace: "\u205F\u200A",
        thinsp: "\u2009",
        ThinSpace: "\u2009",
        thkap: "\u2248",
        thksim: "\u223C",
        THORN: "\xDE",
        thorn: "\xFE",
        Tilde: "\u223C",
        tilde: "\u02DC",
        TildeEqual: "\u2243",
        TildeFullEqual: "\u2245",
        TildeTilde: "\u2248",
        times: "\xD7",
        timesb: "\u22A0",
        timesbar: "\u2A31",
        timesd: "\u2A30",
        tint: "\u222D",
        toea: "\u2928",
        top: "\u22A4",
        topbot: "\u2336",
        topcir: "\u2AF1",
        Topf: "\u{1D54B}",
        topf: "\u{1D565}",
        topfork: "\u2ADA",
        tosa: "\u2929",
        tprime: "\u2034",
        TRADE: "\u2122",
        trade: "\u2122",
        triangle: "\u25B5",
        triangledown: "\u25BF",
        triangleleft: "\u25C3",
        trianglelefteq: "\u22B4",
        triangleq: "\u225C",
        triangleright: "\u25B9",
        trianglerighteq: "\u22B5",
        tridot: "\u25EC",
        trie: "\u225C",
        triminus: "\u2A3A",
        TripleDot: "\u20DB",
        triplus: "\u2A39",
        trisb: "\u29CD",
        tritime: "\u2A3B",
        trpezium: "\u23E2",
        Tscr: "\u{1D4AF}",
        tscr: "\u{1D4C9}",
        TScy: "\u0426",
        tscy: "\u0446",
        TSHcy: "\u040B",
        tshcy: "\u045B",
        Tstrok: "\u0166",
        tstrok: "\u0167",
        twixt: "\u226C",
        twoheadleftarrow: "\u219E",
        twoheadrightarrow: "\u21A0",
        Uacute: "\xDA",
        uacute: "\xFA",
        Uarr: "\u219F",
        uArr: "\u21D1",
        uarr: "\u2191",
        Uarrocir: "\u2949",
        Ubrcy: "\u040E",
        ubrcy: "\u045E",
        Ubreve: "\u016C",
        ubreve: "\u016D",
        Ucirc: "\xDB",
        ucirc: "\xFB",
        Ucy: "\u0423",
        ucy: "\u0443",
        udarr: "\u21C5",
        Udblac: "\u0170",
        udblac: "\u0171",
        udhar: "\u296E",
        ufisht: "\u297E",
        Ufr: "\u{1D518}",
        ufr: "\u{1D532}",
        Ugrave: "\xD9",
        ugrave: "\xF9",
        uHar: "\u2963",
        uharl: "\u21BF",
        uharr: "\u21BE",
        uhblk: "\u2580",
        ulcorn: "\u231C",
        ulcorner: "\u231C",
        ulcrop: "\u230F",
        ultri: "\u25F8",
        Umacr: "\u016A",
        umacr: "\u016B",
        uml: "\xA8",
        UnderBar: "_",
        UnderBrace: "\u23DF",
        UnderBracket: "\u23B5",
        UnderParenthesis: "\u23DD",
        Union: "\u22C3",
        UnionPlus: "\u228E",
        Uogon: "\u0172",
        uogon: "\u0173",
        Uopf: "\u{1D54C}",
        uopf: "\u{1D566}",
        UpArrow: "\u2191",
        Uparrow: "\u21D1",
        uparrow: "\u2191",
        UpArrowBar: "\u2912",
        UpArrowDownArrow: "\u21C5",
        UpDownArrow: "\u2195",
        Updownarrow: "\u21D5",
        updownarrow: "\u2195",
        UpEquilibrium: "\u296E",
        upharpoonleft: "\u21BF",
        upharpoonright: "\u21BE",
        uplus: "\u228E",
        UpperLeftArrow: "\u2196",
        UpperRightArrow: "\u2197",
        Upsi: "\u03D2",
        upsi: "\u03C5",
        upsih: "\u03D2",
        Upsilon: "\u03A5",
        upsilon: "\u03C5",
        UpTee: "\u22A5",
        UpTeeArrow: "\u21A5",
        upuparrows: "\u21C8",
        urcorn: "\u231D",
        urcorner: "\u231D",
        urcrop: "\u230E",
        Uring: "\u016E",
        uring: "\u016F",
        urtri: "\u25F9",
        Uscr: "\u{1D4B0}",
        uscr: "\u{1D4CA}",
        utdot: "\u22F0",
        Utilde: "\u0168",
        utilde: "\u0169",
        utri: "\u25B5",
        utrif: "\u25B4",
        uuarr: "\u21C8",
        Uuml: "\xDC",
        uuml: "\xFC",
        uwangle: "\u29A7",
        vangrt: "\u299C",
        varepsilon: "\u03F5",
        varkappa: "\u03F0",
        varnothing: "\u2205",
        varphi: "\u03D5",
        varpi: "\u03D6",
        varpropto: "\u221D",
        vArr: "\u21D5",
        varr: "\u2195",
        varrho: "\u03F1",
        varsigma: "\u03C2",
        varsubsetneq: "\u228A\uFE00",
        varsubsetneqq: "\u2ACB\uFE00",
        varsupsetneq: "\u228B\uFE00",
        varsupsetneqq: "\u2ACC\uFE00",
        vartheta: "\u03D1",
        vartriangleleft: "\u22B2",
        vartriangleright: "\u22B3",
        Vbar: "\u2AEB",
        vBar: "\u2AE8",
        vBarv: "\u2AE9",
        Vcy: "\u0412",
        vcy: "\u0432",
        VDash: "\u22AB",
        Vdash: "\u22A9",
        vDash: "\u22A8",
        vdash: "\u22A2",
        Vdashl: "\u2AE6",
        Vee: "\u22C1",
        vee: "\u2228",
        veebar: "\u22BB",
        veeeq: "\u225A",
        vellip: "\u22EE",
        Verbar: "\u2016",
        verbar: "|",
        Vert: "\u2016",
        vert: "|",
        VerticalBar: "\u2223",
        VerticalLine: "|",
        VerticalSeparator: "\u2758",
        VerticalTilde: "\u2240",
        VeryThinSpace: "\u200A",
        Vfr: "\u{1D519}",
        vfr: "\u{1D533}",
        vltri: "\u22B2",
        vnsub: "\u2282\u20D2",
        vnsup: "\u2283\u20D2",
        Vopf: "\u{1D54D}",
        vopf: "\u{1D567}",
        vprop: "\u221D",
        vrtri: "\u22B3",
        Vscr: "\u{1D4B1}",
        vscr: "\u{1D4CB}",
        vsubnE: "\u2ACB\uFE00",
        vsubne: "\u228A\uFE00",
        vsupnE: "\u2ACC\uFE00",
        vsupne: "\u228B\uFE00",
        Vvdash: "\u22AA",
        vzigzag: "\u299A",
        Wcirc: "\u0174",
        wcirc: "\u0175",
        wedbar: "\u2A5F",
        Wedge: "\u22C0",
        wedge: "\u2227",
        wedgeq: "\u2259",
        weierp: "\u2118",
        Wfr: "\u{1D51A}",
        wfr: "\u{1D534}",
        Wopf: "\u{1D54E}",
        wopf: "\u{1D568}",
        wp: "\u2118",
        wr: "\u2240",
        wreath: "\u2240",
        Wscr: "\u{1D4B2}",
        wscr: "\u{1D4CC}",
        xcap: "\u22C2",
        xcirc: "\u25EF",
        xcup: "\u22C3",
        xdtri: "\u25BD",
        Xfr: "\u{1D51B}",
        xfr: "\u{1D535}",
        xhArr: "\u27FA",
        xharr: "\u27F7",
        Xi: "\u039E",
        xi: "\u03BE",
        xlArr: "\u27F8",
        xlarr: "\u27F5",
        xmap: "\u27FC",
        xnis: "\u22FB",
        xodot: "\u2A00",
        Xopf: "\u{1D54F}",
        xopf: "\u{1D569}",
        xoplus: "\u2A01",
        xotime: "\u2A02",
        xrArr: "\u27F9",
        xrarr: "\u27F6",
        Xscr: "\u{1D4B3}",
        xscr: "\u{1D4CD}",
        xsqcup: "\u2A06",
        xuplus: "\u2A04",
        xutri: "\u25B3",
        xvee: "\u22C1",
        xwedge: "\u22C0",
        Yacute: "\xDD",
        yacute: "\xFD",
        YAcy: "\u042F",
        yacy: "\u044F",
        Ycirc: "\u0176",
        ycirc: "\u0177",
        Ycy: "\u042B",
        ycy: "\u044B",
        yen: "\xA5",
        Yfr: "\u{1D51C}",
        yfr: "\u{1D536}",
        YIcy: "\u0407",
        yicy: "\u0457",
        Yopf: "\u{1D550}",
        yopf: "\u{1D56A}",
        Yscr: "\u{1D4B4}",
        yscr: "\u{1D4CE}",
        YUcy: "\u042E",
        yucy: "\u044E",
        Yuml: "\u0178",
        yuml: "\xFF",
        Zacute: "\u0179",
        zacute: "\u017A",
        Zcaron: "\u017D",
        zcaron: "\u017E",
        Zcy: "\u0417",
        zcy: "\u0437",
        Zdot: "\u017B",
        zdot: "\u017C",
        zeetrf: "\u2128",
        ZeroWidthSpace: "\u200B",
        Zeta: "\u0396",
        zeta: "\u03B6",
        Zfr: "\u2128",
        zfr: "\u{1D537}",
        ZHcy: "\u0416",
        zhcy: "\u0436",
        zigrarr: "\u21DD",
        Zopf: "\u2124",
        zopf: "\u{1D56B}",
        Zscr: "\u{1D4B5}",
        zscr: "\u{1D4CF}",
        zwj: "\u200D",
        zwnj: "\u200C"
      });
      exports2.entityMap = exports2.HTML_ENTITIES;
    }
  });

  // node_modules/@xmldom/xmldom/lib/sax.js
  var require_sax = __commonJS({
    "node_modules/@xmldom/xmldom/lib/sax.js"(exports2) {
      "use strict";
      var conventions = require_conventions();
      var g = require_grammar();
      var errors = require_errors();
      var isHTMLEscapableRawTextElement = conventions.isHTMLEscapableRawTextElement;
      var isHTMLMimeType = conventions.isHTMLMimeType;
      var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
      var hasOwn = conventions.hasOwn;
      var NAMESPACE = conventions.NAMESPACE;
      var ParseError = errors.ParseError;
      var DOMException = errors.DOMException;
      var S_TAG = 0;
      var S_ATTR = 1;
      var S_ATTR_SPACE = 2;
      var S_EQ = 3;
      var S_ATTR_NOQUOT_VALUE = 4;
      var S_ATTR_END = 5;
      var S_TAG_SPACE = 6;
      var S_TAG_CLOSE = 7;
      function XMLReader() {
      }
      XMLReader.prototype = {
        parse: function(source, defaultNSMap, entityMap) {
          var domBuilder = this.domBuilder;
          domBuilder.startDocument();
          _copy(defaultNSMap, defaultNSMap = /* @__PURE__ */ Object.create(null));
          parse(source, defaultNSMap, entityMap, domBuilder, this.errorHandler);
          domBuilder.endDocument();
        }
      };
      var ENTITY_REG = /&#?\w+;?/g;
      function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
        var isHTML = isHTMLMimeType(domBuilder.mimeType);
        if (source.indexOf(g.UNICODE_REPLACEMENT_CHARACTER) >= 0) {
          errorHandler.warning("Unicode replacement character detected, source encoding issues?");
        }
        function fixedFromCharCode(code) {
          if (code > 65535) {
            code -= 65536;
            var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
            return String.fromCharCode(surrogate1, surrogate2);
          } else {
            return String.fromCharCode(code);
          }
        }
        function entityReplacer(a2) {
          var complete = a2[a2.length - 1] === ";" ? a2 : a2 + ";";
          if (!isHTML && complete !== a2) {
            errorHandler.error("EntityRef: expecting ;");
            return a2;
          }
          var match = g.Reference.exec(complete);
          if (!match || match[0].length !== complete.length) {
            errorHandler.error("entity not matching Reference production: " + a2);
            return a2;
          }
          var k = complete.slice(1, -1);
          if (hasOwn(entityMap, k)) {
            return entityMap[k];
          } else if (k.charAt(0) === "#") {
            return fixedFromCharCode(parseInt(k.substring(1).replace("x", "0x")));
          } else {
            errorHandler.error("entity not found:" + a2);
            return a2;
          }
        }
        function appendText(end2) {
          if (end2 > start) {
            var xt = source.substring(start, end2).replace(ENTITY_REG, entityReplacer);
            locator && position(start);
            domBuilder.characters(xt, 0, end2 - start);
            start = end2;
          }
        }
        var lineStart = 0;
        var lineEnd = 0;
        var linePattern = /\r\n?|\n|$/g;
        var locator = domBuilder.locator;
        function position(p, m) {
          while (p >= lineEnd && (m = linePattern.exec(source))) {
            lineStart = lineEnd;
            lineEnd = m.index + m[0].length;
            locator.lineNumber++;
          }
          locator.columnNumber = p - lineStart + 1;
        }
        var parseStack = [{ currentNSMap: defaultNSMapCopy }];
        var unclosedTags = [];
        var start = 0;
        while (true) {
          try {
            var tagStart = source.indexOf("<", start);
            if (tagStart < 0) {
              if (!isHTML && unclosedTags.length > 0) {
                return errorHandler.fatalError("unclosed xml tag(s): " + unclosedTags.join(", "));
              }
              if (!source.substring(start).match(/^\s*$/)) {
                var doc = domBuilder.doc;
                var text = doc.createTextNode(source.substring(start));
                if (doc.documentElement) {
                  return errorHandler.error("Extra content at the end of the document");
                }
                doc.appendChild(text);
                domBuilder.currentElement = text;
              }
              return;
            }
            if (tagStart > start) {
              var fromSource = source.substring(start, tagStart);
              if (!isHTML && unclosedTags.length === 0) {
                fromSource = fromSource.replace(new RegExp(g.S_OPT.source, "g"), "");
                fromSource && errorHandler.error("Unexpected content outside root element: '" + fromSource + "'");
              }
              appendText(tagStart);
            }
            switch (source.charAt(tagStart + 1)) {
              case "/":
                var end = source.indexOf(">", tagStart + 2);
                var tagNameRaw = source.substring(tagStart + 2, end > 0 ? end : void 0);
                if (!tagNameRaw) {
                  return errorHandler.fatalError("end tag name missing");
                }
                var tagNameMatch = end > 0 && g.reg("^", g.QName_group, g.S_OPT, "$").exec(tagNameRaw);
                if (!tagNameMatch) {
                  return errorHandler.fatalError('end tag name contains invalid characters: "' + tagNameRaw + '"');
                }
                if (!domBuilder.currentElement && !domBuilder.doc.documentElement) {
                  return;
                }
                var currentTagName = unclosedTags[unclosedTags.length - 1] || domBuilder.currentElement.tagName || domBuilder.doc.documentElement.tagName || "";
                if (currentTagName !== tagNameMatch[1]) {
                  var tagNameLower = tagNameMatch[1].toLowerCase();
                  if (!isHTML || currentTagName.toLowerCase() !== tagNameLower) {
                    return errorHandler.fatalError('Opening and ending tag mismatch: "' + currentTagName + '" != "' + tagNameRaw + '"');
                  }
                }
                var config = parseStack.pop();
                unclosedTags.pop();
                var localNSMap = config.localNSMap;
                domBuilder.endElement(config.uri, config.localName, currentTagName);
                if (localNSMap) {
                  for (var prefix in localNSMap) {
                    if (hasOwn(localNSMap, prefix)) {
                      domBuilder.endPrefixMapping(prefix);
                    }
                  }
                }
                end++;
                break;
              // end element
              case "?":
                locator && position(tagStart);
                end = parseProcessingInstruction(source, tagStart, domBuilder, errorHandler);
                break;
              case "!":
                locator && position(tagStart);
                end = parseDoctypeCommentOrCData(source, tagStart, domBuilder, errorHandler, isHTML);
                break;
              default:
                locator && position(tagStart);
                var el = new ElementAttributes();
                var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
                var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler, isHTML);
                var len = el.length;
                if (!el.closed) {
                  if (isHTML && conventions.isHTMLVoidElement(el.tagName)) {
                    el.closed = true;
                  } else {
                    unclosedTags.push(el.tagName);
                  }
                }
                if (locator && len) {
                  var locator2 = copyLocator(locator, {});
                  for (var i = 0; i < len; i++) {
                    var a = el[i];
                    position(a.offset);
                    a.locator = copyLocator(locator, {});
                  }
                  domBuilder.locator = locator2;
                  if (appendElement(el, domBuilder, currentNSMap)) {
                    parseStack.push(el);
                  }
                  domBuilder.locator = locator;
                } else {
                  if (appendElement(el, domBuilder, currentNSMap)) {
                    parseStack.push(el);
                  }
                }
                if (isHTML && !el.closed) {
                  end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
                } else {
                  end++;
                }
            }
          } catch (e) {
            if (e instanceof ParseError) {
              throw e;
            } else if (e instanceof DOMException) {
              throw new ParseError(e.name + ": " + e.message, domBuilder.locator, e);
            }
            errorHandler.error("element parse error: " + e);
            end = -1;
          }
          if (end > start) {
            start = end;
          } else {
            appendText(Math.max(tagStart, start) + 1);
          }
        }
      }
      function copyLocator(f, t) {
        t.lineNumber = f.lineNumber;
        t.columnNumber = f.columnNumber;
        return t;
      }
      function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler, isHTML) {
        function addAttribute(qname, value2, startIndex) {
          if (hasOwn(el.attributeNames, qname)) {
            return errorHandler.fatalError("Attribute " + qname + " redefined");
          }
          if (!isHTML && value2.indexOf("<") >= 0) {
            return errorHandler.fatalError("Unescaped '<' not allowed in attributes values");
          }
          el.addValue(
            qname,
            // @see https://www.w3.org/TR/xml/#AVNormalize
            // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
            // - recursive replacement of (DTD) entity references
            // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
            value2.replace(/[\t\n\r]/g, " ").replace(ENTITY_REG, entityReplacer),
            startIndex
          );
        }
        var attrName;
        var value;
        var p = ++start;
        var s = S_TAG;
        while (true) {
          var c = source.charAt(p);
          switch (c) {
            case "=":
              if (s === S_ATTR) {
                attrName = source.slice(start, p);
                s = S_EQ;
              } else if (s === S_ATTR_SPACE) {
                s = S_EQ;
              } else {
                throw new Error("attribute equal must after attrName");
              }
              break;
            case "'":
            case '"':
              if (s === S_EQ || s === S_ATTR) {
                if (s === S_ATTR) {
                  errorHandler.warning('attribute value must after "="');
                  attrName = source.slice(start, p);
                }
                start = p + 1;
                p = source.indexOf(c, start);
                if (p > 0) {
                  value = source.slice(start, p);
                  addAttribute(attrName, value, start - 1);
                  s = S_ATTR_END;
                } else {
                  throw new Error("attribute value no end '" + c + "' match");
                }
              } else if (s == S_ATTR_NOQUOT_VALUE) {
                value = source.slice(start, p);
                addAttribute(attrName, value, start);
                errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
                start = p + 1;
                s = S_ATTR_END;
              } else {
                throw new Error('attribute value must after "="');
              }
              break;
            case "/":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  s = S_TAG_CLOSE;
                  el.closed = true;
                case S_ATTR_NOQUOT_VALUE:
                case S_ATTR:
                  break;
                case S_ATTR_SPACE:
                  el.closed = true;
                  break;
                //case S_EQ:
                default:
                  throw new Error("attribute invalid close char('/')");
              }
              break;
            case "":
              errorHandler.error("unexpected end of input");
              if (s == S_TAG) {
                el.setTagName(source.slice(start, p));
              }
              return p;
            case ">":
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                case S_ATTR_END:
                case S_TAG_SPACE:
                case S_TAG_CLOSE:
                  break;
                //normal
                case S_ATTR_NOQUOT_VALUE:
                //Compatible state
                case S_ATTR:
                  value = source.slice(start, p);
                  if (value.slice(-1) === "/") {
                    el.closed = true;
                    value = value.slice(0, -1);
                  }
                case S_ATTR_SPACE:
                  if (s === S_ATTR_SPACE) {
                    value = attrName;
                  }
                  if (s == S_ATTR_NOQUOT_VALUE) {
                    errorHandler.warning('attribute "' + value + '" missed quot(")!');
                    addAttribute(attrName, value, start);
                  } else {
                    if (!isHTML) {
                      errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
                    }
                    addAttribute(value, value, start);
                  }
                  break;
                case S_EQ:
                  if (!isHTML) {
                    return errorHandler.fatalError(`AttValue: ' or " expected`);
                  }
              }
              return p;
            /*xml space '\x20' | #x9 | #xD | #xA; */
            case "\x80":
              c = " ";
            default:
              if (c <= " ") {
                switch (s) {
                  case S_TAG:
                    el.setTagName(source.slice(start, p));
                    s = S_TAG_SPACE;
                    break;
                  case S_ATTR:
                    attrName = source.slice(start, p);
                    s = S_ATTR_SPACE;
                    break;
                  case S_ATTR_NOQUOT_VALUE:
                    var value = source.slice(start, p);
                    errorHandler.warning('attribute "' + value + '" missed quot(")!!');
                    addAttribute(attrName, value, start);
                  case S_ATTR_END:
                    s = S_TAG_SPACE;
                    break;
                }
              } else {
                switch (s) {
                  //case S_TAG:void();break;
                  //case S_ATTR:void();break;
                  //case S_ATTR_NOQUOT_VALUE:void();break;
                  case S_ATTR_SPACE:
                    if (!isHTML) {
                      errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
                    }
                    addAttribute(attrName, attrName, start);
                    start = p;
                    s = S_ATTR;
                    break;
                  case S_ATTR_END:
                    errorHandler.warning('attribute space is required"' + attrName + '"!!');
                  case S_TAG_SPACE:
                    s = S_ATTR;
                    start = p;
                    break;
                  case S_EQ:
                    s = S_ATTR_NOQUOT_VALUE;
                    start = p;
                    break;
                  case S_TAG_CLOSE:
                    throw new Error("elements closed character '/' and '>' must be connected to");
                }
              }
          }
          p++;
        }
      }
      function appendElement(el, domBuilder, currentNSMap) {
        var tagName = el.tagName;
        var localNSMap = null;
        var i = el.length;
        while (i--) {
          var a = el[i];
          var qName = a.qName;
          var value = a.value;
          var nsp = qName.indexOf(":");
          if (nsp > 0) {
            var prefix = a.prefix = qName.slice(0, nsp);
            var localName = qName.slice(nsp + 1);
            var nsPrefix = prefix === "xmlns" && localName;
          } else {
            localName = qName;
            prefix = null;
            nsPrefix = qName === "xmlns" && "";
          }
          a.localName = localName;
          if (nsPrefix !== false) {
            if (localNSMap == null) {
              localNSMap = /* @__PURE__ */ Object.create(null);
              _copy(currentNSMap, currentNSMap = /* @__PURE__ */ Object.create(null));
            }
            currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
            a.uri = NAMESPACE.XMLNS;
            domBuilder.startPrefixMapping(nsPrefix, value);
          }
        }
        var i = el.length;
        while (i--) {
          a = el[i];
          if (a.prefix) {
            if (a.prefix === "xml") {
              a.uri = NAMESPACE.XML;
            }
            if (a.prefix !== "xmlns") {
              a.uri = currentNSMap[a.prefix];
            }
          }
        }
        var nsp = tagName.indexOf(":");
        if (nsp > 0) {
          prefix = el.prefix = tagName.slice(0, nsp);
          localName = el.localName = tagName.slice(nsp + 1);
        } else {
          prefix = null;
          localName = el.localName = tagName;
        }
        var ns = el.uri = currentNSMap[prefix || ""];
        domBuilder.startElement(ns, localName, tagName, el);
        if (el.closed) {
          domBuilder.endElement(ns, localName, tagName);
          if (localNSMap) {
            for (prefix in localNSMap) {
              if (hasOwn(localNSMap, prefix)) {
                domBuilder.endPrefixMapping(prefix);
              }
            }
          }
        } else {
          el.currentNSMap = currentNSMap;
          el.localNSMap = localNSMap;
          return true;
        }
      }
      function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
        var isEscapableRaw = isHTMLEscapableRawTextElement(tagName);
        if (isEscapableRaw || isHTMLRawTextElement(tagName)) {
          var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
          var text = source.substring(elStartEnd + 1, elEndStart);
          if (isEscapableRaw) {
            text = text.replace(ENTITY_REG, entityReplacer);
          }
          domBuilder.characters(text, 0, text.length);
          return elEndStart;
        }
        return elStartEnd + 1;
      }
      function _copy(source, target) {
        for (var n in source) {
          if (hasOwn(source, n)) {
            target[n] = source[n];
          }
        }
      }
      function parseUtils(source, start) {
        var index = start;
        function char(n) {
          n = n || 0;
          return source.charAt(index + n);
        }
        function skip(n) {
          n = n || 1;
          index += n;
        }
        function skipBlanks() {
          var blanks = 0;
          while (index < source.length) {
            var c = char();
            if (c !== " " && c !== "\n" && c !== "	" && c !== "\r") {
              return blanks;
            }
            blanks++;
            skip();
          }
          return -1;
        }
        function substringFromIndex() {
          return source.substring(index);
        }
        function substringStartsWith(text) {
          return source.substring(index, index + text.length) === text;
        }
        function substringStartsWithCaseInsensitive(text) {
          return source.substring(index, index + text.length).toUpperCase() === text.toUpperCase();
        }
        function getMatch(args) {
          var expr = g.reg("^", args);
          var match = expr.exec(substringFromIndex());
          if (match) {
            skip(match[0].length);
            return match[0];
          }
          return null;
        }
        return {
          char,
          getIndex: function() {
            return index;
          },
          getMatch,
          getSource: function() {
            return source;
          },
          skip,
          skipBlanks,
          substringFromIndex,
          substringStartsWith,
          substringStartsWithCaseInsensitive
        };
      }
      function parseDoctypeInternalSubset(p, errorHandler) {
        function parsePI(p2, errorHandler2) {
          var match = g.PI.exec(p2.substringFromIndex());
          if (!match) {
            return errorHandler2.fatalError("processing instruction is not well-formed at position " + p2.getIndex());
          }
          if (match[1].toLowerCase() === "xml") {
            return errorHandler2.fatalError(
              "xml declaration is only allowed at the start of the document, but found at position " + p2.getIndex()
            );
          }
          p2.skip(match[0].length);
          return match[0];
        }
        var source = p.getSource();
        if (p.char() === "[") {
          p.skip(1);
          var intSubsetStart = p.getIndex();
          while (p.getIndex() < source.length) {
            p.skipBlanks();
            if (p.char() === "]") {
              var internalSubset = source.substring(intSubsetStart, p.getIndex());
              p.skip(1);
              return internalSubset;
            }
            var current = null;
            if (p.char() === "<" && p.char(1) === "!") {
              switch (p.char(2)) {
                case "E":
                  if (p.char(3) === "L") {
                    current = p.getMatch(g.elementdecl);
                  } else if (p.char(3) === "N") {
                    current = p.getMatch(g.EntityDecl);
                  }
                  break;
                case "A":
                  current = p.getMatch(g.AttlistDecl);
                  break;
                case "N":
                  current = p.getMatch(g.NotationDecl);
                  break;
                case "-":
                  current = p.getMatch(g.Comment);
                  break;
              }
            } else if (p.char() === "<" && p.char(1) === "?") {
              current = parsePI(p, errorHandler);
            } else if (p.char() === "%") {
              current = p.getMatch(g.PEReference);
            } else {
              return errorHandler.fatalError("Error detected in Markup declaration");
            }
            if (!current) {
              return errorHandler.fatalError("Error in internal subset at position " + p.getIndex());
            }
          }
          return errorHandler.fatalError("doctype internal subset is not well-formed, missing ]");
        }
      }
      function parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler, isHTML) {
        var p = parseUtils(source, start);
        switch (isHTML ? p.char(2).toUpperCase() : p.char(2)) {
          case "-":
            var comment = p.getMatch(g.Comment);
            if (comment) {
              domBuilder.comment(comment, g.COMMENT_START.length, comment.length - g.COMMENT_START.length - g.COMMENT_END.length);
              return p.getIndex();
            } else {
              return errorHandler.fatalError("comment is not well-formed at position " + p.getIndex());
            }
          case "[":
            var cdata = p.getMatch(g.CDSect);
            if (cdata) {
              if (!isHTML && !domBuilder.currentElement) {
                return errorHandler.fatalError("CDATA outside of element");
              }
              domBuilder.startCDATA();
              domBuilder.characters(cdata, g.CDATA_START.length, cdata.length - g.CDATA_START.length - g.CDATA_END.length);
              domBuilder.endCDATA();
              return p.getIndex();
            } else {
              return errorHandler.fatalError("Invalid CDATA starting at position " + start);
            }
          case "D": {
            if (domBuilder.doc && domBuilder.doc.documentElement) {
              return errorHandler.fatalError("Doctype not allowed inside or after documentElement at position " + p.getIndex());
            }
            if (isHTML ? !p.substringStartsWithCaseInsensitive(g.DOCTYPE_DECL_START) : !p.substringStartsWith(g.DOCTYPE_DECL_START)) {
              return errorHandler.fatalError("Expected " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
            }
            p.skip(g.DOCTYPE_DECL_START.length);
            if (p.skipBlanks() < 1) {
              return errorHandler.fatalError("Expected whitespace after " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
            }
            var doctype = {
              name: void 0,
              publicId: void 0,
              systemId: void 0,
              internalSubset: void 0
            };
            doctype.name = p.getMatch(g.Name);
            if (!doctype.name)
              return errorHandler.fatalError("doctype name missing or contains unexpected characters at position " + p.getIndex());
            if (isHTML && doctype.name.toLowerCase() !== "html") {
              errorHandler.warning("Unexpected DOCTYPE in HTML document at position " + p.getIndex());
            }
            p.skipBlanks();
            if (p.substringStartsWith(g.PUBLIC) || p.substringStartsWith(g.SYSTEM)) {
              var match = g.ExternalID_match.exec(p.substringFromIndex());
              if (!match) {
                return errorHandler.fatalError("doctype external id is not well-formed at position " + p.getIndex());
              }
              if (match.groups.SystemLiteralOnly !== void 0) {
                doctype.systemId = match.groups.SystemLiteralOnly;
              } else {
                doctype.systemId = match.groups.SystemLiteral;
                doctype.publicId = match.groups.PubidLiteral;
              }
              p.skip(match[0].length);
            } else if (isHTML && p.substringStartsWithCaseInsensitive(g.SYSTEM)) {
              p.skip(g.SYSTEM.length);
              if (p.skipBlanks() < 1) {
                return errorHandler.fatalError("Expected whitespace after " + g.SYSTEM + " at position " + p.getIndex());
              }
              doctype.systemId = p.getMatch(g.ABOUT_LEGACY_COMPAT_SystemLiteral);
              if (!doctype.systemId) {
                return errorHandler.fatalError(
                  "Expected " + g.ABOUT_LEGACY_COMPAT + " in single or double quotes after " + g.SYSTEM + " at position " + p.getIndex()
                );
              }
            }
            if (isHTML && doctype.systemId && !g.ABOUT_LEGACY_COMPAT_SystemLiteral.test(doctype.systemId)) {
              errorHandler.warning("Unexpected doctype.systemId in HTML document at position " + p.getIndex());
            }
            if (!isHTML) {
              p.skipBlanks();
              doctype.internalSubset = parseDoctypeInternalSubset(p, errorHandler);
            }
            p.skipBlanks();
            if (p.char() !== ">") {
              return errorHandler.fatalError("doctype not terminated with > at position " + p.getIndex());
            }
            p.skip(1);
            domBuilder.startDTD(doctype.name, doctype.publicId, doctype.systemId, doctype.internalSubset);
            domBuilder.endDTD();
            return p.getIndex();
          }
          default:
            return errorHandler.fatalError('Not well-formed XML starting with "<!" at position ' + start);
        }
      }
      function parseProcessingInstruction(source, start, domBuilder, errorHandler) {
        var match = source.substring(start).match(g.PI);
        if (!match) {
          return errorHandler.fatalError("Invalid processing instruction starting at position " + start);
        }
        if (match[1].toLowerCase() === "xml") {
          if (start > 0) {
            return errorHandler.fatalError(
              "processing instruction at position " + start + " is an xml declaration which is only at the start of the document"
            );
          }
          if (!g.XMLDecl.test(source.substring(start))) {
            return errorHandler.fatalError("xml declaration is not well-formed");
          }
        }
        domBuilder.processingInstruction(match[1], match[2]);
        return start + match[0].length;
      }
      function ElementAttributes() {
        this.attributeNames = /* @__PURE__ */ Object.create(null);
      }
      ElementAttributes.prototype = {
        setTagName: function(tagName) {
          if (!g.QName_exact.test(tagName)) {
            throw new Error("invalid tagName:" + tagName);
          }
          this.tagName = tagName;
        },
        addValue: function(qName, value, offset) {
          if (!g.QName_exact.test(qName)) {
            throw new Error("invalid attribute:" + qName);
          }
          this.attributeNames[qName] = this.length;
          this[this.length++] = { qName, value, offset };
        },
        length: 0,
        getLocalName: function(i) {
          return this[i].localName;
        },
        getLocator: function(i) {
          return this[i].locator;
        },
        getQName: function(i) {
          return this[i].qName;
        },
        getURI: function(i) {
          return this[i].uri;
        },
        getValue: function(i) {
          return this[i].value;
        }
        //	,getIndex:function(uri, localName)){
        //		if(localName){
        //
        //		}else{
        //			var qName = uri
        //		}
        //	},
        //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
        //	getType:function(uri,localName){}
        //	getType:function(i){},
      };
      exports2.XMLReader = XMLReader;
      exports2.parseUtils = parseUtils;
      exports2.parseDoctypeCommentOrCData = parseDoctypeCommentOrCData;
    }
  });

  // node_modules/@xmldom/xmldom/lib/dom-parser.js
  var require_dom_parser = __commonJS({
    "node_modules/@xmldom/xmldom/lib/dom-parser.js"(exports2) {
      "use strict";
      var conventions = require_conventions();
      var dom = require_dom();
      var errors = require_errors();
      var entities = require_entities();
      var sax = require_sax();
      var DOMImplementation = dom.DOMImplementation;
      var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
      var isHTMLMimeType = conventions.isHTMLMimeType;
      var isValidMimeType = conventions.isValidMimeType;
      var MIME_TYPE = conventions.MIME_TYPE;
      var NAMESPACE = conventions.NAMESPACE;
      var ParseError = errors.ParseError;
      var XMLReader = sax.XMLReader;
      function normalizeLineEndings(input) {
        return input.replace(/\r[\n\u0085]/g, "\n").replace(/[\r\u0085\u2028\u2029]/g, "\n");
      }
      function DOMParser2(options) {
        options = options || {};
        if (options.locator === void 0) {
          options.locator = true;
        }
        this.assign = options.assign || conventions.assign;
        this.domHandler = options.domHandler || DOMHandler;
        this.onError = options.onError || options.errorHandler;
        if (options.errorHandler && typeof options.errorHandler !== "function") {
          throw new TypeError("errorHandler object is no longer supported, switch to onError!");
        } else if (options.errorHandler) {
          options.errorHandler("warning", "The `errorHandler` option has been deprecated, use `onError` instead!", this);
        }
        this.normalizeLineEndings = options.normalizeLineEndings || normalizeLineEndings;
        this.locator = !!options.locator;
        this.xmlns = this.assign(/* @__PURE__ */ Object.create(null), options.xmlns);
      }
      DOMParser2.prototype.parseFromString = function(source, mimeType) {
        if (!isValidMimeType(mimeType)) {
          throw new TypeError('DOMParser.parseFromString: the provided mimeType "' + mimeType + '" is not valid.');
        }
        var defaultNSMap = this.assign(/* @__PURE__ */ Object.create(null), this.xmlns);
        var entityMap = entities.XML_ENTITIES;
        var defaultNamespace = defaultNSMap[""] || null;
        if (hasDefaultHTMLNamespace(mimeType)) {
          entityMap = entities.HTML_ENTITIES;
          defaultNamespace = NAMESPACE.HTML;
        } else if (mimeType === MIME_TYPE.XML_SVG_IMAGE) {
          defaultNamespace = NAMESPACE.SVG;
        }
        defaultNSMap[""] = defaultNamespace;
        defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
        var domBuilder = new this.domHandler({
          mimeType,
          defaultNamespace,
          onError: this.onError
        });
        var locator = this.locator ? {} : void 0;
        if (this.locator) {
          domBuilder.setDocumentLocator(locator);
        }
        var sax2 = new XMLReader();
        sax2.errorHandler = domBuilder;
        sax2.domBuilder = domBuilder;
        var isXml = !conventions.isHTMLMimeType(mimeType);
        if (isXml && typeof source !== "string") {
          sax2.errorHandler.fatalError("source is not a string");
        }
        sax2.parse(this.normalizeLineEndings(String(source)), defaultNSMap, entityMap);
        if (!domBuilder.doc.documentElement) {
          sax2.errorHandler.fatalError("missing root element");
        }
        return domBuilder.doc;
      };
      function DOMHandler(options) {
        var opt = options || {};
        this.mimeType = opt.mimeType || MIME_TYPE.XML_APPLICATION;
        this.defaultNamespace = opt.defaultNamespace || null;
        this.cdata = false;
        this.currentElement = void 0;
        this.doc = void 0;
        this.locator = void 0;
        this.onError = opt.onError;
      }
      function position(locator, node) {
        node.lineNumber = locator.lineNumber;
        node.columnNumber = locator.columnNumber;
      }
      DOMHandler.prototype = {
        /**
         * Either creates an XML or an HTML document and stores it under `this.doc`.
         * If it is an XML document, `this.defaultNamespace` is used to create it,
         * and it will not contain any `childNodes`.
         * If it is an HTML document, it will be created without any `childNodes`.
         *
         * @see http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
         */
        startDocument: function() {
          var impl = new DOMImplementation();
          this.doc = isHTMLMimeType(this.mimeType) ? impl.createHTMLDocument(false) : impl.createDocument(this.defaultNamespace, "");
        },
        startElement: function(namespaceURI, localName, qName, attrs) {
          var doc = this.doc;
          var el = doc.createElementNS(namespaceURI, qName || localName);
          var len = attrs.length;
          appendElement(this, el);
          this.currentElement = el;
          this.locator && position(this.locator, el);
          for (var i = 0; i < len; i++) {
            var namespaceURI = attrs.getURI(i);
            var value = attrs.getValue(i);
            var qName = attrs.getQName(i);
            var attr = doc.createAttributeNS(namespaceURI, qName);
            this.locator && position(attrs.getLocator(i), attr);
            attr.value = attr.nodeValue = value;
            el.setAttributeNode(attr);
          }
        },
        endElement: function(namespaceURI, localName, qName) {
          this.currentElement = this.currentElement.parentNode;
        },
        startPrefixMapping: function(prefix, uri) {
        },
        endPrefixMapping: function(prefix) {
        },
        processingInstruction: function(target, data) {
          var ins = this.doc.createProcessingInstruction(target, data);
          this.locator && position(this.locator, ins);
          appendElement(this, ins);
        },
        ignorableWhitespace: function(ch, start, length) {
        },
        characters: function(chars, start, length) {
          chars = _toString.apply(this, arguments);
          if (chars) {
            if (this.cdata) {
              var charNode = this.doc.createCDATASection(chars);
            } else {
              var charNode = this.doc.createTextNode(chars);
            }
            if (this.currentElement) {
              this.currentElement.appendChild(charNode);
            } else if (/^\s*$/.test(chars)) {
              this.doc.appendChild(charNode);
            }
            this.locator && position(this.locator, charNode);
          }
        },
        skippedEntity: function(name) {
        },
        endDocument: function() {
          this.doc.normalize();
        },
        /**
         * Stores the locator to be able to set the `columnNumber` and `lineNumber`
         * on the created DOM nodes.
         *
         * @param {Locator} locator
         */
        setDocumentLocator: function(locator) {
          if (locator) {
            locator.lineNumber = 0;
          }
          this.locator = locator;
        },
        //LexicalHandler
        comment: function(chars, start, length) {
          chars = _toString.apply(this, arguments);
          var comm = this.doc.createComment(chars);
          this.locator && position(this.locator, comm);
          appendElement(this, comm);
        },
        startCDATA: function() {
          this.cdata = true;
        },
        endCDATA: function() {
          this.cdata = false;
        },
        startDTD: function(name, publicId, systemId, internalSubset) {
          var impl = this.doc.implementation;
          if (impl && impl.createDocumentType) {
            var dt = impl.createDocumentType(name, publicId, systemId, internalSubset);
            this.locator && position(this.locator, dt);
            appendElement(this, dt);
            this.doc.doctype = dt;
          }
        },
        reportError: function(level, message) {
          if (typeof this.onError === "function") {
            try {
              this.onError(level, message, this);
            } catch (e) {
              throw new ParseError("Reporting " + level + ' "' + message + '" caused ' + e, this.locator);
            }
          } else {
            console.error("[xmldom " + level + "]	" + message, _locator(this.locator));
          }
        },
        /**
         * @see http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
         */
        warning: function(message) {
          this.reportError("warning", message);
        },
        error: function(message) {
          this.reportError("error", message);
        },
        /**
         * This function reports a fatal error and throws a ParseError.
         *
         * @param {string} message
         * - The message to be used for reporting and throwing the error.
         * @returns {never}
         * This function always throws an error and never returns a value.
         * @throws {ParseError}
         * Always throws a ParseError with the provided message.
         */
        fatalError: function(message) {
          this.reportError("fatalError", message);
          throw new ParseError(message, this.locator);
        }
      };
      function _locator(l) {
        if (l) {
          return "\n@#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
        }
      }
      function _toString(chars, start, length) {
        if (typeof chars == "string") {
          return chars.substr(start, length);
        } else {
          if (chars.length >= start + length || start) {
            return new java.lang.String(chars, start, length) + "";
          }
          return chars;
        }
      }
      "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(
        /\w+/g,
        function(key) {
          DOMHandler.prototype[key] = function() {
            return null;
          };
        }
      );
      function appendElement(handler, node) {
        if (!handler.currentElement) {
          handler.doc.appendChild(node);
        } else {
          handler.currentElement.appendChild(node);
        }
      }
      function onErrorStopParsing(level) {
        if (level === "error") throw "onErrorStopParsing";
      }
      function onWarningStopParsing() {
        throw "onWarningStopParsing";
      }
      exports2.__DOMHandler = DOMHandler;
      exports2.DOMParser = DOMParser2;
      exports2.normalizeLineEndings = normalizeLineEndings;
      exports2.onErrorStopParsing = onErrorStopParsing;
      exports2.onWarningStopParsing = onWarningStopParsing;
    }
  });

  // node_modules/@xmldom/xmldom/lib/index.js
  var require_lib = __commonJS({
    "node_modules/@xmldom/xmldom/lib/index.js"(exports2) {
      "use strict";
      var conventions = require_conventions();
      exports2.assign = conventions.assign;
      exports2.hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
      exports2.isHTMLMimeType = conventions.isHTMLMimeType;
      exports2.isValidMimeType = conventions.isValidMimeType;
      exports2.MIME_TYPE = conventions.MIME_TYPE;
      exports2.NAMESPACE = conventions.NAMESPACE;
      var errors = require_errors();
      exports2.DOMException = errors.DOMException;
      exports2.DOMExceptionName = errors.DOMExceptionName;
      exports2.ExceptionCode = errors.ExceptionCode;
      exports2.ParseError = errors.ParseError;
      var dom = require_dom();
      exports2.Attr = dom.Attr;
      exports2.CDATASection = dom.CDATASection;
      exports2.CharacterData = dom.CharacterData;
      exports2.Comment = dom.Comment;
      exports2.Document = dom.Document;
      exports2.DocumentFragment = dom.DocumentFragment;
      exports2.DocumentType = dom.DocumentType;
      exports2.DOMImplementation = dom.DOMImplementation;
      exports2.Element = dom.Element;
      exports2.Entity = dom.Entity;
      exports2.EntityReference = dom.EntityReference;
      exports2.LiveNodeList = dom.LiveNodeList;
      exports2.NamedNodeMap = dom.NamedNodeMap;
      exports2.Node = dom.Node;
      exports2.NodeList = dom.NodeList;
      exports2.Notation = dom.Notation;
      exports2.ProcessingInstruction = dom.ProcessingInstruction;
      exports2.Text = dom.Text;
      exports2.XMLSerializer = dom.XMLSerializer;
      var domParser = require_dom_parser();
      exports2.DOMParser = domParser.DOMParser;
      exports2.normalizeLineEndings = domParser.normalizeLineEndings;
      exports2.onErrorStopParsing = domParser.onErrorStopParsing;
      exports2.onWarningStopParsing = domParser.onWarningStopParsing;
    }
  });

  // node_modules/mathjax/es5/node-main.js
  var require_node_main = __commonJS({
    "node_modules/mathjax/es5/node-main.js"(exports, module) {
      (function() {
        "use strict";
        var __webpack_modules__ = { 444: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.HTMLAdaptor = void 0;
          var a = (function(t2) {
            function e2(e3) {
              var r2 = t2.call(this, e3.document) || this;
              return r2.window = e3, r2.parser = new e3.DOMParser(), r2;
            }
            return o(e2, t2), e2.prototype.parse = function(t3, e3) {
              return void 0 === e3 && (e3 = "text/html"), this.parser.parseFromString(t3, e3);
            }, e2.prototype.create = function(t3, e3) {
              return e3 ? this.document.createElementNS(e3, t3) : this.document.createElement(t3);
            }, e2.prototype.text = function(t3) {
              return this.document.createTextNode(t3);
            }, e2.prototype.head = function(t3) {
              return t3.head || t3;
            }, e2.prototype.body = function(t3) {
              return t3.body || t3;
            }, e2.prototype.root = function(t3) {
              return t3.documentElement || t3;
            }, e2.prototype.doctype = function(t3) {
              return t3.doctype ? "<!DOCTYPE ".concat(t3.doctype.name, ">") : "";
            }, e2.prototype.tags = function(t3, e3, r2) {
              void 0 === r2 && (r2 = null);
              var n2 = r2 ? t3.getElementsByTagNameNS(r2, e3) : t3.getElementsByTagName(e3);
              return Array.from(n2);
            }, e2.prototype.getElements = function(t3, e3) {
              var r2, n2, o2 = [];
              try {
                for (var a2 = i(t3), s = a2.next(); !s.done; s = a2.next()) {
                  var l = s.value;
                  "string" == typeof l ? o2 = o2.concat(Array.from(this.document.querySelectorAll(l))) : Array.isArray(l) || l instanceof this.window.NodeList || l instanceof this.window.HTMLCollection ? o2 = o2.concat(Array.from(l)) : o2.push(l);
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  s && !s.done && (n2 = a2.return) && n2.call(a2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return o2;
            }, e2.prototype.contains = function(t3, e3) {
              return t3.contains(e3);
            }, e2.prototype.parent = function(t3) {
              return t3.parentNode;
            }, e2.prototype.append = function(t3, e3) {
              return t3.appendChild(e3);
            }, e2.prototype.insert = function(t3, e3) {
              return this.parent(e3).insertBefore(t3, e3);
            }, e2.prototype.remove = function(t3) {
              return this.parent(t3).removeChild(t3);
            }, e2.prototype.replace = function(t3, e3) {
              return this.parent(e3).replaceChild(t3, e3);
            }, e2.prototype.clone = function(t3) {
              return t3.cloneNode(true);
            }, e2.prototype.split = function(t3, e3) {
              return t3.splitText(e3);
            }, e2.prototype.next = function(t3) {
              return t3.nextSibling;
            }, e2.prototype.previous = function(t3) {
              return t3.previousSibling;
            }, e2.prototype.firstChild = function(t3) {
              return t3.firstChild;
            }, e2.prototype.lastChild = function(t3) {
              return t3.lastChild;
            }, e2.prototype.childNodes = function(t3) {
              return Array.from(t3.childNodes);
            }, e2.prototype.childNode = function(t3, e3) {
              return t3.childNodes[e3];
            }, e2.prototype.kind = function(t3) {
              var e3 = t3.nodeType;
              return 1 === e3 || 3 === e3 || 8 === e3 ? t3.nodeName.toLowerCase() : "";
            }, e2.prototype.value = function(t3) {
              return t3.nodeValue || "";
            }, e2.prototype.textContent = function(t3) {
              return t3.textContent;
            }, e2.prototype.innerHTML = function(t3) {
              return t3.innerHTML;
            }, e2.prototype.outerHTML = function(t3) {
              return t3.outerHTML;
            }, e2.prototype.serializeXML = function(t3) {
              return new this.window.XMLSerializer().serializeToString(t3);
            }, e2.prototype.setAttribute = function(t3, e3, r2, n2) {
              return void 0 === n2 && (n2 = null), n2 ? (e3 = n2.replace(/.*\//, "") + ":" + e3.replace(/^.*:/, ""), t3.setAttributeNS(n2, e3, r2)) : t3.setAttribute(e3, r2);
            }, e2.prototype.getAttribute = function(t3, e3) {
              return t3.getAttribute(e3);
            }, e2.prototype.removeAttribute = function(t3, e3) {
              return t3.removeAttribute(e3);
            }, e2.prototype.hasAttribute = function(t3, e3) {
              return t3.hasAttribute(e3);
            }, e2.prototype.allAttributes = function(t3) {
              return Array.from(t3.attributes).map((function(t4) {
                return { name: t4.name, value: t4.value };
              }));
            }, e2.prototype.addClass = function(t3, e3) {
              t3.classList ? t3.classList.add(e3) : t3.className = (t3.className + " " + e3).trim();
            }, e2.prototype.removeClass = function(t3, e3) {
              t3.classList ? t3.classList.remove(e3) : t3.className = t3.className.split(/ /).filter((function(t4) {
                return t4 !== e3;
              })).join(" ");
            }, e2.prototype.hasClass = function(t3, e3) {
              return t3.classList ? t3.classList.contains(e3) : t3.className.split(/ /).indexOf(e3) >= 0;
            }, e2.prototype.setStyle = function(t3, e3, r2) {
              t3.style[e3] = r2;
            }, e2.prototype.getStyle = function(t3, e3) {
              return t3.style[e3];
            }, e2.prototype.allStyles = function(t3) {
              return t3.style.cssText;
            }, e2.prototype.insertRules = function(t3, e3) {
              var r2, n2;
              try {
                for (var o2 = i(e3.reverse()), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  var s = a2.value;
                  try {
                    t3.sheet.insertRule(s, 0);
                  } catch (t4) {
                    console.warn("MathJax: can't insert css rule '".concat(s, "': ").concat(t4.message));
                  }
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  a2 && !a2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
            }, e2.prototype.fontSize = function(t3) {
              var e3 = this.window.getComputedStyle(t3);
              return parseFloat(e3.fontSize);
            }, e2.prototype.fontFamily = function(t3) {
              return this.window.getComputedStyle(t3).fontFamily || "";
            }, e2.prototype.nodeSize = function(t3, e3, r2) {
              if (void 0 === e3 && (e3 = 1), void 0 === r2 && (r2 = false), r2 && t3.getBBox) {
                var n2 = t3.getBBox();
                return [n2.width / e3, n2.height / e3];
              }
              return [t3.offsetWidth / e3, t3.offsetHeight / e3];
            }, e2.prototype.nodeBBox = function(t3) {
              var e3 = t3.getBoundingClientRect();
              return { left: e3.left, right: e3.right, top: e3.top, bottom: e3.bottom };
            }, e2;
          })(r(5009).AbstractDOMAdaptor);
          e.HTMLAdaptor = a;
        }, 1131: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.NodeMixin = e.NodeMixinOptions = void 0;
          var a = r(7233);
          e.NodeMixinOptions = { badCSS: true, badSizes: true }, e.NodeMixin = function(t2, r2) {
            var n2;
            return void 0 === r2 && (r2 = {}), r2 = (0, a.userOptions)((0, a.defaultOptions)({}, e.NodeMixinOptions), r2), n2 = (function(t3) {
              function e2() {
                for (var e3 = [], r3 = 0; r3 < arguments.length; r3++) e3[r3] = arguments[r3];
                var n3 = t3.call(this, e3[0]) || this, o2 = n3.constructor;
                return n3.options = (0, a.userOptions)((0, a.defaultOptions)({}, o2.OPTIONS), e3[1]), n3;
              }
              return o(e2, t3), e2.prototype.fontSize = function(e3) {
                return r2.badCSS ? this.options.fontSize : t3.prototype.fontSize.call(this, e3);
              }, e2.prototype.fontFamily = function(e3) {
                return r2.badCSS ? this.options.fontFamily : t3.prototype.fontFamily.call(this, e3);
              }, e2.prototype.nodeSize = function(n3, o2, i2) {
                if (void 0 === o2 && (o2 = 1), void 0 === i2 && (i2 = null), !r2.badSizes) return t3.prototype.nodeSize.call(this, n3, o2, i2);
                var a2 = this.textContent(n3), s = Array.from(a2.replace(e2.cjkPattern, "")).length;
                return [(Array.from(a2).length - s) * this.options.cjkCharWidth + s * this.options.unknownCharWidth, this.options.unknownCharHeight];
              }, e2.prototype.nodeBBox = function(e3) {
                return r2.badSizes ? { left: 0, right: 0, top: 0, bottom: 0 } : t3.prototype.nodeBBox.call(this, e3);
              }, e2;
            })(t2), n2.OPTIONS = i(i({}, r2.badCSS ? { fontSize: 16, fontFamily: "Times" } : {}), r2.badSizes ? { cjkCharWidth: 1, unknownCharWidth: 0.6, unknownCharHeight: 0.8 } : {}), n2.cjkPattern = new RegExp(["[", "\u1100-\u115F", "\u2329\u232A", "\u2E80-\u303E", "\u3040-\u3247", "\u3250-\u4DBF", "\u4E00-\uA4C6", "\uA960-\uA97C", "\uAC00-\uD7A3", "\uF900-\uFAFF", "\uFE10-\uFE19", "\uFE30-\uFE6B", "\uFF01-\uFF60\uFFE0-\uFFE6", "\u{1B000}-\u{1B001}", "\u{1F200}-\u{1F251}", "\u{20000}-\u{3FFFD}", "]"].join(""), "gu"), n2;
          };
        }, 6191: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.browserAdaptor = void 0;
          var n = r(444);
          e.browserAdaptor = function() {
            return new n.HTMLAdaptor(window);
          };
        }, 7062: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.LiteDocument = void 0;
          var n = r(1168), o = (function() {
            function t2() {
              this.root = new n.LiteElement("html", {}, [this.head = new n.LiteElement("head"), this.body = new n.LiteElement("body")]), this.type = "";
            }
            return Object.defineProperty(t2.prototype, "kind", { get: function() {
              return "#document";
            }, enumerable: false, configurable: true }), t2;
          })();
          e.LiteDocument = o;
        }, 1168: function(t, e) {
          var r = this && this.__assign || function() {
            return r = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, r.apply(this, arguments);
          }, n = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, o = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          }, i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.LiteElement = void 0;
          var a = function(t2, e2, a2) {
            var s, l;
            void 0 === e2 && (e2 = {}), void 0 === a2 && (a2 = []), this.kind = t2, this.attributes = r({}, e2), this.children = o([], n(a2), false);
            try {
              for (var c = i(this.children), u = c.next(); !u.done; u = c.next()) u.value.parent = this;
            } catch (t3) {
              s = { error: t3 };
            } finally {
              try {
                u && !u.done && (l = c.return) && l.call(c);
              } finally {
                if (s) throw s.error;
              }
            }
            this.styles = null;
          };
          e.LiteElement = a;
        }, 315: function(t, e) {
          var r = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i = r2.call(t2), a = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i.next()).done; ) a.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i.return) && r2.call(i);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a;
          }, n = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i = e2.length; o2 < i; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.LiteList = void 0;
          var o = (function() {
            function t2(t3) {
              this.nodes = [], this.nodes = n([], r(t3), false);
            }
            return t2.prototype.append = function(t3) {
              this.nodes.push(t3);
            }, t2.prototype[Symbol.iterator] = function() {
              var t3 = 0;
              return { next: function() {
                return t3 === this.nodes.length ? { value: null, done: true } : { value: this.nodes[t3++], done: false };
              } };
            }, t2;
          })();
          e.LiteList = o;
        }, 5020: function(t, e, r) {
          var n = this && this.__createBinding || (Object.create ? function(t2, e2, r2, n2) {
            void 0 === n2 && (n2 = r2);
            var o2 = Object.getOwnPropertyDescriptor(e2, r2);
            o2 && !("get" in o2 ? !e2.__esModule : o2.writable || o2.configurable) || (o2 = { enumerable: true, get: function() {
              return e2[r2];
            } }), Object.defineProperty(t2, n2, o2);
          } : function(t2, e2, r2, n2) {
            void 0 === n2 && (n2 = r2), t2[n2] = e2[r2];
          }), o = this && this.__setModuleDefault || (Object.create ? function(t2, e2) {
            Object.defineProperty(t2, "default", { enumerable: true, value: e2 });
          } : function(t2, e2) {
            t2.default = e2;
          }), i = this && this.__importStar || function(t2) {
            if (t2 && t2.__esModule) return t2;
            var e2 = {};
            if (null != t2) for (var r2 in t2) "default" !== r2 && Object.prototype.hasOwnProperty.call(t2, r2) && n(e2, t2, r2);
            return o(e2, t2), e2;
          }, a = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, s = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.LiteParser = e.PATTERNS = void 0;
          var l, c = i(r(5368)), u = r(1168), p = r(2560);
          !(function(t2) {
            t2.TAGNAME = "[a-z][^\\s\\n>]*", t2.ATTNAME = "[a-z][^\\s\\n>=]*", t2.VALUE = `(?:'[^']*'|"[^"]*"|[^\\s\\n]+)`, t2.VALUESPLIT = `(?:'([^']*)'|"([^"]*)"|([^\\s\\n]+))`, t2.SPACE = "(?:\\s|\\n)+", t2.OPTIONALSPACE = "(?:\\s|\\n)*", t2.ATTRIBUTE = t2.ATTNAME + "(?:" + t2.OPTIONALSPACE + "=" + t2.OPTIONALSPACE + t2.VALUE + ")?", t2.ATTRIBUTESPLIT = "(" + t2.ATTNAME + ")(?:" + t2.OPTIONALSPACE + "=" + t2.OPTIONALSPACE + t2.VALUESPLIT + ")?", t2.TAG = "(<(?:" + t2.TAGNAME + "(?:" + t2.SPACE + t2.ATTRIBUTE + ")*" + t2.OPTIONALSPACE + "/?|/" + t2.TAGNAME + "|!--[^]*?--|![^]*?)(?:>|$))", t2.tag = new RegExp(t2.TAG, "i"), t2.attr = new RegExp(t2.ATTRIBUTE, "i"), t2.attrsplit = new RegExp(t2.ATTRIBUTESPLIT, "i");
          })(l = e.PATTERNS || (e.PATTERNS = {}));
          var f = (function() {
            function t2() {
            }
            return t2.prototype.parseFromString = function(t3, e2, r2) {
              void 0 === e2 && (e2 = "text/html"), void 0 === r2 && (r2 = null);
              for (var n2 = r2.createDocument(), o2 = r2.body(n2), i2 = t3.replace(/<\?.*?\?>/g, "").split(l.tag); i2.length; ) {
                var a2 = i2.shift(), s2 = i2.shift();
                a2 && this.addText(r2, o2, a2), s2 && ">" === s2.charAt(s2.length - 1) && ("!" === s2.charAt(1) ? this.addComment(r2, o2, s2) : o2 = "/" === s2.charAt(1) ? this.closeTag(r2, o2, s2) : this.openTag(r2, o2, s2, i2));
              }
              return this.checkDocument(r2, n2), n2;
            }, t2.prototype.addText = function(t3, e2, r2) {
              return r2 = c.translate(r2), t3.append(e2, t3.text(r2));
            }, t2.prototype.addComment = function(t3, e2, r2) {
              return t3.append(e2, new p.LiteComment(r2));
            }, t2.prototype.closeTag = function(t3, e2, r2) {
              for (var n2 = r2.slice(2, r2.length - 1).toLowerCase(); t3.parent(e2) && t3.kind(e2) !== n2; ) e2 = t3.parent(e2);
              return t3.parent(e2);
            }, t2.prototype.openTag = function(t3, e2, r2, n2) {
              var o2 = this.constructor.PCDATA, i2 = this.constructor.SELF_CLOSING, a2 = r2.match(/<(.*?)[\s\n>\/]/)[1].toLowerCase(), s2 = t3.node(a2), c2 = r2.replace(/^<.*?[\s\n>]/, "").split(l.attrsplit);
              return (c2.pop().match(/>$/) || c2.length < 5) && (this.addAttributes(t3, s2, c2), t3.append(e2, s2), i2[a2] || r2.match(/\/>$/) || (o2[a2] ? this.handlePCDATA(t3, s2, a2, n2) : e2 = s2)), e2;
            }, t2.prototype.addAttributes = function(t3, e2, r2) {
              for (var n2 = this.constructor.CDATA_ATTR; r2.length; ) {
                var o2 = a(r2.splice(0, 5), 5), i2 = o2[1], s2 = o2[2], l2 = o2[3], u2 = o2[4], p2 = s2 || l2 || u2 || "";
                n2[i2] || (p2 = c.translate(p2)), t3.setAttribute(e2, i2, p2);
              }
            }, t2.prototype.handlePCDATA = function(t3, e2, r2, n2) {
              for (var o2 = [], i2 = "</" + r2 + ">", a2 = ""; n2.length && a2 !== i2; ) o2.push(a2), o2.push(n2.shift()), a2 = n2.shift();
              t3.append(e2, t3.text(o2.join("")));
            }, t2.prototype.checkDocument = function(t3, e2) {
              var r2, n2, o2, i2, a2 = this.getOnlyChild(t3, t3.body(e2));
              if (a2) {
                try {
                  for (var l2 = s(t3.childNodes(t3.body(e2))), c2 = l2.next(); !c2.done; c2 = l2.next()) {
                    if ((h = c2.value) === a2) break;
                    h instanceof p.LiteComment && h.value.match(/^<!DOCTYPE/) && (e2.type = h.value);
                  }
                } catch (t4) {
                  r2 = { error: t4 };
                } finally {
                  try {
                    c2 && !c2.done && (n2 = l2.return) && n2.call(l2);
                  } finally {
                    if (r2) throw r2.error;
                  }
                }
                switch (t3.kind(a2)) {
                  case "html":
                    try {
                      for (var u2 = s(a2.children), f2 = u2.next(); !f2.done; f2 = u2.next()) {
                        var h = f2.value;
                        switch (t3.kind(h)) {
                          case "head":
                            e2.head = h;
                            break;
                          case "body":
                            e2.body = h;
                        }
                      }
                    } catch (t4) {
                      o2 = { error: t4 };
                    } finally {
                      try {
                        f2 && !f2.done && (i2 = u2.return) && i2.call(u2);
                      } finally {
                        if (o2) throw o2.error;
                      }
                    }
                    e2.root = a2, t3.remove(a2), t3.parent(e2.body) !== a2 && t3.append(a2, e2.body), t3.parent(e2.head) !== a2 && t3.insert(e2.head, e2.body);
                    break;
                  case "head":
                    e2.head = t3.replace(a2, e2.head);
                    break;
                  case "body":
                    e2.body = t3.replace(a2, e2.body);
                }
              }
            }, t2.prototype.getOnlyChild = function(t3, e2) {
              var r2, n2, o2 = null;
              try {
                for (var i2 = s(t3.childNodes(e2)), a2 = i2.next(); !a2.done; a2 = i2.next()) {
                  var l2 = a2.value;
                  if (l2 instanceof u.LiteElement) {
                    if (o2) return null;
                    o2 = l2;
                  }
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  a2 && !a2.done && (n2 = i2.return) && n2.call(i2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return o2;
            }, t2.prototype.serialize = function(t3, e2, r2) {
              var n2 = this;
              void 0 === r2 && (r2 = false);
              var o2 = this.constructor.SELF_CLOSING, i2 = this.constructor.CDATA_ATTR, a2 = t3.kind(e2), s2 = t3.allAttributes(e2).map((function(t4) {
                return t4.name + '="' + (i2[t4.name] ? t4.value : n2.protectAttribute(t4.value)) + '"';
              })).join(" "), l2 = this.serializeInner(t3, e2, r2);
              return "<" + a2 + (s2 ? " " + s2 : "") + (r2 && !l2 || o2[a2] ? r2 ? "/>" : ">" : ">".concat(l2, "</").concat(a2, ">"));
            }, t2.prototype.serializeInner = function(t3, e2, r2) {
              var n2 = this;
              return void 0 === r2 && (r2 = false), this.constructor.PCDATA.hasOwnProperty(e2.kind) ? t3.childNodes(e2).map((function(e3) {
                return t3.value(e3);
              })).join("") : t3.childNodes(e2).map((function(e3) {
                var o2 = t3.kind(e3);
                return "#text" === o2 ? n2.protectHTML(t3.value(e3)) : "#comment" === o2 ? e3.value : n2.serialize(t3, e3, r2);
              })).join("");
            }, t2.prototype.protectAttribute = function(t3) {
              return "string" != typeof t3 && (t3 = String(t3)), t3.replace(/"/g, "&quot;");
            }, t2.prototype.protectHTML = function(t3) {
              return t3.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }, t2.SELF_CLOSING = { area: true, base: true, br: true, col: true, command: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, menuitem: true, meta: true, param: true, source: true, track: true, wbr: true }, t2.PCDATA = { option: true, textarea: true, fieldset: true, title: true, style: true, script: true }, t2.CDATA_ATTR = { style: true, datafld: true, datasrc: true, href: true, src: true, longdesc: true, usemap: true, cite: true, datetime: true, action: true, axis: true, profile: true, content: true, scheme: true }, t2;
          })();
          e.LiteParser = f;
        }, 2560: function(t, e) {
          var r, n = this && this.__extends || (r = function(t2, e2) {
            return r = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, r(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function n2() {
              this.constructor = t2;
            }
            r(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (n2.prototype = e2.prototype, new n2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.LiteComment = e.LiteText = void 0;
          var o = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = ""), this.value = t3;
            }
            return Object.defineProperty(t2.prototype, "kind", { get: function() {
              return "#text";
            }, enumerable: false, configurable: true }), t2;
          })();
          e.LiteText = o;
          var i = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return n(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "#comment";
            }, enumerable: false, configurable: true }), e2;
          })(o);
          e.LiteComment = i;
        }, 1248: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.LiteWindow = void 0;
          var n = r(1168), o = r(7062), i = r(315), a = r(5020), s = function() {
            this.DOMParser = a.LiteParser, this.NodeList = i.LiteList, this.HTMLCollection = i.LiteList, this.HTMLElement = n.LiteElement, this.DocumentFragment = i.LiteList, this.Document = o.LiteDocument, this.document = new o.LiteDocument();
          };
          e.LiteWindow = s;
        }, 4907: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, s = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, l = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.liteAdaptor = e.LiteAdaptor = e.LiteBase = void 0;
          var c = r(5009), u = r(1131), p = r(7062), f = r(1168), h = r(2560), d = r(1248), y = r(5020), O = r(8054), m = (function(t2) {
            function e2() {
              var e3 = t2.call(this) || this;
              return e3.parser = new y.LiteParser(), e3.window = new d.LiteWindow(), e3;
            }
            return o(e2, t2), e2.prototype.parse = function(t3, e3) {
              return this.parser.parseFromString(t3, e3, this);
            }, e2.prototype.create = function(t3, e3) {
              return void 0 === e3 && (e3 = null), new f.LiteElement(t3);
            }, e2.prototype.text = function(t3) {
              return new h.LiteText(t3);
            }, e2.prototype.comment = function(t3) {
              return new h.LiteComment(t3);
            }, e2.prototype.createDocument = function() {
              return new p.LiteDocument();
            }, e2.prototype.head = function(t3) {
              return t3.head;
            }, e2.prototype.body = function(t3) {
              return t3.body;
            }, e2.prototype.root = function(t3) {
              return t3.root;
            }, e2.prototype.doctype = function(t3) {
              return t3.type;
            }, e2.prototype.tags = function(t3, e3, r2) {
              void 0 === r2 && (r2 = null);
              var n2 = [], o2 = [];
              if (r2) return o2;
              for (var i2 = t3; i2; ) {
                var a2 = i2.kind;
                "#text" !== a2 && "#comment" !== a2 && (i2 = i2, a2 === e3 && o2.push(i2), i2.children.length && (n2 = i2.children.concat(n2))), i2 = n2.shift();
              }
              return o2;
            }, e2.prototype.elementById = function(t3, e3) {
              for (var r2 = [], n2 = t3; n2; ) {
                if ("#text" !== n2.kind && "#comment" !== n2.kind) {
                  if ((n2 = n2).attributes.id === e3) return n2;
                  n2.children.length && (r2 = n2.children.concat(r2));
                }
                n2 = r2.shift();
              }
              return null;
            }, e2.prototype.elementsByClass = function(t3, e3) {
              for (var r2 = [], n2 = [], o2 = t3; o2; ) {
                if ("#text" !== o2.kind && "#comment" !== o2.kind) ((o2 = o2).attributes.class || "").trim().split(/ +/).includes(e3) && n2.push(o2), o2.children.length && (r2 = o2.children.concat(r2));
                o2 = r2.shift();
              }
              return n2;
            }, e2.prototype.getElements = function(t3, e3) {
              var r2, n2, o2 = [], i2 = this.body(e3);
              try {
                for (var s2 = a(t3), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                  var c2 = l2.value;
                  if ("string" == typeof c2) if ("#" === c2.charAt(0)) {
                    var u2 = this.elementById(i2, c2.slice(1));
                    u2 && o2.push(u2);
                  } else "." === c2.charAt(0) ? o2 = o2.concat(this.elementsByClass(i2, c2.slice(1))) : c2.match(/^[-a-z][-a-z0-9]*$/i) && (o2 = o2.concat(this.tags(i2, c2)));
                  else Array.isArray(c2) ? o2 = o2.concat(c2) : c2 instanceof this.window.NodeList || c2 instanceof this.window.HTMLCollection ? o2 = o2.concat(c2.nodes) : o2.push(c2);
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  l2 && !l2.done && (n2 = s2.return) && n2.call(s2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return o2;
            }, e2.prototype.contains = function(t3, e3) {
              for (; e3 && e3 !== t3; ) e3 = this.parent(e3);
              return !!e3;
            }, e2.prototype.parent = function(t3) {
              return t3.parent;
            }, e2.prototype.childIndex = function(t3) {
              return t3.parent ? t3.parent.children.findIndex((function(e3) {
                return e3 === t3;
              })) : -1;
            }, e2.prototype.append = function(t3, e3) {
              return e3.parent && this.remove(e3), t3.children.push(e3), e3.parent = t3, e3;
            }, e2.prototype.insert = function(t3, e3) {
              if (t3.parent && this.remove(t3), e3 && e3.parent) {
                var r2 = this.childIndex(e3);
                e3.parent.children.splice(r2, 0, t3), t3.parent = e3.parent;
              }
            }, e2.prototype.remove = function(t3) {
              var e3 = this.childIndex(t3);
              return e3 >= 0 && t3.parent.children.splice(e3, 1), t3.parent = null, t3;
            }, e2.prototype.replace = function(t3, e3) {
              var r2 = this.childIndex(e3);
              return r2 >= 0 && (e3.parent.children[r2] = t3, t3.parent = e3.parent, e3.parent = null), e3;
            }, e2.prototype.clone = function(t3) {
              var e3 = this, r2 = new f.LiteElement(t3.kind);
              return r2.attributes = i({}, t3.attributes), r2.children = t3.children.map((function(t4) {
                if ("#text" === t4.kind) return new h.LiteText(t4.value);
                if ("#comment" === t4.kind) return new h.LiteComment(t4.value);
                var n2 = e3.clone(t4);
                return n2.parent = r2, n2;
              })), r2;
            }, e2.prototype.split = function(t3, e3) {
              var r2 = new h.LiteText(t3.value.slice(e3));
              return t3.value = t3.value.slice(0, e3), t3.parent.children.splice(this.childIndex(t3) + 1, 0, r2), r2.parent = t3.parent, r2;
            }, e2.prototype.next = function(t3) {
              var e3 = t3.parent;
              if (!e3) return null;
              var r2 = this.childIndex(t3) + 1;
              return r2 >= 0 && r2 < e3.children.length ? e3.children[r2] : null;
            }, e2.prototype.previous = function(t3) {
              var e3 = t3.parent;
              if (!e3) return null;
              var r2 = this.childIndex(t3) - 1;
              return r2 >= 0 ? e3.children[r2] : null;
            }, e2.prototype.firstChild = function(t3) {
              return t3.children[0];
            }, e2.prototype.lastChild = function(t3) {
              return t3.children[t3.children.length - 1];
            }, e2.prototype.childNodes = function(t3) {
              return l([], s(t3.children), false);
            }, e2.prototype.childNode = function(t3, e3) {
              return t3.children[e3];
            }, e2.prototype.kind = function(t3) {
              return t3.kind;
            }, e2.prototype.value = function(t3) {
              return "#text" === t3.kind ? t3.value : "#comment" === t3.kind ? t3.value.replace(/^<!(--)?((?:.|\n)*)\1>$/, "$2") : "";
            }, e2.prototype.textContent = function(t3) {
              var e3 = this;
              return t3.children.reduce((function(t4, r2) {
                return t4 + ("#text" === r2.kind ? r2.value : "#comment" === r2.kind ? "" : e3.textContent(r2));
              }), "");
            }, e2.prototype.innerHTML = function(t3) {
              return this.parser.serializeInner(this, t3);
            }, e2.prototype.outerHTML = function(t3) {
              return this.parser.serialize(this, t3);
            }, e2.prototype.serializeXML = function(t3) {
              return this.parser.serialize(this, t3, true);
            }, e2.prototype.setAttribute = function(t3, e3, r2, n2) {
              void 0 === n2 && (n2 = null), "string" != typeof r2 && (r2 = String(r2)), n2 && (e3 = n2.replace(/.*\//, "") + ":" + e3.replace(/^.*:/, "")), t3.attributes[e3] = r2, "style" === e3 && (t3.styles = null);
            }, e2.prototype.getAttribute = function(t3, e3) {
              return t3.attributes[e3];
            }, e2.prototype.removeAttribute = function(t3, e3) {
              delete t3.attributes[e3];
            }, e2.prototype.hasAttribute = function(t3, e3) {
              return t3.attributes.hasOwnProperty(e3);
            }, e2.prototype.allAttributes = function(t3) {
              var e3, r2, n2 = t3.attributes, o2 = [];
              try {
                for (var i2 = a(Object.keys(n2)), s2 = i2.next(); !s2.done; s2 = i2.next()) {
                  var l2 = s2.value;
                  o2.push({ name: l2, value: n2[l2] });
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  s2 && !s2.done && (r2 = i2.return) && r2.call(i2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              return o2;
            }, e2.prototype.addClass = function(t3, e3) {
              var r2 = (t3.attributes.class || "").split(/ /);
              r2.find((function(t4) {
                return t4 === e3;
              })) || (r2.push(e3), t3.attributes.class = r2.join(" "));
            }, e2.prototype.removeClass = function(t3, e3) {
              var r2 = (t3.attributes.class || "").split(/ /), n2 = r2.findIndex((function(t4) {
                return t4 === e3;
              }));
              n2 >= 0 && (r2.splice(n2, 1), t3.attributes.class = r2.join(" "));
            }, e2.prototype.hasClass = function(t3, e3) {
              return !!(t3.attributes.class || "").split(/ /).find((function(t4) {
                return t4 === e3;
              }));
            }, e2.prototype.setStyle = function(t3, e3, r2) {
              t3.styles || (t3.styles = new O.Styles(this.getAttribute(t3, "style"))), t3.styles.set(e3, r2), t3.attributes.style = t3.styles.cssText;
            }, e2.prototype.getStyle = function(t3, e3) {
              if (!t3.styles) {
                var r2 = this.getAttribute(t3, "style");
                if (!r2) return "";
                t3.styles = new O.Styles(r2);
              }
              return t3.styles.get(e3);
            }, e2.prototype.allStyles = function(t3) {
              return this.getAttribute(t3, "style");
            }, e2.prototype.insertRules = function(t3, e3) {
              t3.children = [this.text(e3.join("\n\n") + "\n\n" + this.textContent(t3))];
            }, e2.prototype.fontSize = function(t3) {
              return 0;
            }, e2.prototype.fontFamily = function(t3) {
              return "";
            }, e2.prototype.nodeSize = function(t3, e3, r2) {
              return void 0 === e3 && (e3 = 1), void 0 === r2 && (r2 = null), [0, 0];
            }, e2.prototype.nodeBBox = function(t3) {
              return { left: 0, right: 0, top: 0, bottom: 0 };
            }, e2;
          })(c.AbstractDOMAdaptor);
          e.LiteBase = m;
          var v = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2;
          })((0, u.NodeMixin)(m));
          e.LiteAdaptor = v, e.liteAdaptor = function(t2) {
            return void 0 === t2 && (t2 = null), new v(null, t2);
          };
        }, 9515: function(t, e, r) {
          var n = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MathJax = e.combineWithMathJax = e.combineDefaults = e.combineConfig = e.isObject = void 0;
          var o = r(3282);
          function i(t2) {
            return "object" == typeof t2 && null !== t2;
          }
          function a(t2, e2) {
            var r2, o2;
            try {
              for (var s = n(Object.keys(e2)), l = s.next(); !l.done; l = s.next()) {
                var c = l.value;
                "__esModule" !== c && (!i(t2[c]) || !i(e2[c]) || e2[c] instanceof Promise ? null !== e2[c] && void 0 !== e2[c] && (t2[c] = e2[c]) : a(t2[c], e2[c]));
              }
            } catch (t3) {
              r2 = { error: t3 };
            } finally {
              try {
                l && !l.done && (o2 = s.return) && o2.call(s);
              } finally {
                if (r2) throw r2.error;
              }
            }
            return t2;
          }
          e.isObject = i, e.combineConfig = a, e.combineDefaults = function t2(e2, r2, o2) {
            var a2, s;
            e2[r2] || (e2[r2] = {}), e2 = e2[r2];
            try {
              for (var l = n(Object.keys(o2)), c = l.next(); !c.done; c = l.next()) {
                var u = c.value;
                i(e2[u]) && i(o2[u]) ? t2(e2, u, o2[u]) : null == e2[u] && null != o2[u] && (e2[u] = o2[u]);
              }
            } catch (t3) {
              a2 = { error: t3 };
            } finally {
              try {
                c && !c.done && (s = l.return) && s.call(l);
              } finally {
                if (a2) throw a2.error;
              }
            }
            return e2;
          }, e.combineWithMathJax = function(t2) {
            return a(e.MathJax, t2);
          }, void 0 === r.g.MathJax && (r.g.MathJax = {}), r.g.MathJax.version || (r.g.MathJax = { version: o.VERSION, _: {}, config: r.g.MathJax }), e.MathJax = r.g.MathJax;
        }, 235: function(t, e, r) {
          var n, o, i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.CONFIG = e.MathJax = e.Loader = e.PathFilters = e.PackageError = e.Package = void 0;
          var a = r(9515), s = r(265), l = r(265);
          Object.defineProperty(e, "Package", { enumerable: true, get: function() {
            return l.Package;
          } }), Object.defineProperty(e, "PackageError", { enumerable: true, get: function() {
            return l.PackageError;
          } });
          var c, u = r(7525);
          if (e.PathFilters = { source: function(t2) {
            return e.CONFIG.source.hasOwnProperty(t2.name) && (t2.name = e.CONFIG.source[t2.name]), true;
          }, normalize: function(t2) {
            var e2 = t2.name;
            return e2.match(/^(?:[a-z]+:\/)?\/|[a-z]:\\|\[/i) || (t2.name = "[mathjax]/" + e2.replace(/^\.\//, "")), t2.addExtension && !e2.match(/\.[^\/]+$/) && (t2.name += ".js"), true;
          }, prefix: function(t2) {
            for (var r2; (r2 = t2.name.match(/^\[([^\]]*)\]/)) && e.CONFIG.paths.hasOwnProperty(r2[1]); ) t2.name = e.CONFIG.paths[r2[1]] + t2.name.substr(r2[0].length);
            return true;
          } }, (function(t2) {
            var r2 = a.MathJax.version;
            t2.versions = /* @__PURE__ */ new Map(), t2.ready = function() {
              for (var t3, e2, r3 = [], n2 = 0; n2 < arguments.length; n2++) r3[n2] = arguments[n2];
              0 === r3.length && (r3 = Array.from(s.Package.packages.keys()));
              var o2 = [];
              try {
                for (var a2 = i(r3), l2 = a2.next(); !l2.done; l2 = a2.next()) {
                  var c2 = l2.value, u2 = s.Package.packages.get(c2) || new s.Package(c2, true);
                  o2.push(u2.promise);
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  l2 && !l2.done && (e2 = a2.return) && e2.call(a2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return Promise.all(o2);
            }, t2.load = function() {
              for (var r3, n2, o2 = [], a2 = 0; a2 < arguments.length; a2++) o2[a2] = arguments[a2];
              if (0 === o2.length) return Promise.resolve();
              var l2 = [], c2 = function(r4) {
                var n3 = s.Package.packages.get(r4);
                n3 || (n3 = new s.Package(r4)).provides(e.CONFIG.provides[r4]), n3.checkNoLoad(), l2.push(n3.promise.then((function() {
                  e.CONFIG.versionWarnings && n3.isLoaded && !t2.versions.has(s.Package.resolvePath(r4)) && console.warn("No version information available for component ".concat(r4));
                })));
              };
              try {
                for (var u2 = i(o2), p2 = u2.next(); !p2.done; p2 = u2.next()) {
                  var f2 = p2.value;
                  c2(f2);
                }
              } catch (t3) {
                r3 = { error: t3 };
              } finally {
                try {
                  p2 && !p2.done && (n2 = u2.return) && n2.call(u2);
                } finally {
                  if (r3) throw r3.error;
                }
              }
              return s.Package.loadAll(), Promise.all(l2);
            }, t2.preLoad = function() {
              for (var t3, r3, n2 = [], o2 = 0; o2 < arguments.length; o2++) n2[o2] = arguments[o2];
              try {
                for (var a2 = i(n2), l2 = a2.next(); !l2.done; l2 = a2.next()) {
                  var c2 = l2.value, u2 = s.Package.packages.get(c2);
                  u2 || (u2 = new s.Package(c2, true)).provides(e.CONFIG.provides[c2]), u2.loaded();
                }
              } catch (e2) {
                t3 = { error: e2 };
              } finally {
                try {
                  l2 && !l2.done && (r3 = a2.return) && r3.call(a2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
            }, t2.defaultReady = function() {
              void 0 !== e.MathJax.startup && e.MathJax.config.startup.ready();
            }, t2.getRoot = function() {
              var t3 = "//../../es5";
              if ("undefined" != typeof document) {
                var e2 = document.currentScript || document.getElementById("MathJax-script");
                e2 && (t3 = e2.src.replace(/\/[^\/]*$/, ""));
              }
              return t3;
            }, t2.checkVersion = function(n2, o2, i2) {
              return t2.versions.set(s.Package.resolvePath(n2), r2), !(!e.CONFIG.versionWarnings || o2 === r2) && (console.warn("Component ".concat(n2, " uses ").concat(o2, " of MathJax; version in use is ").concat(r2)), true);
            }, t2.pathFilters = new u.FunctionList(), t2.pathFilters.add(e.PathFilters.source, 0), t2.pathFilters.add(e.PathFilters.normalize, 10), t2.pathFilters.add(e.PathFilters.prefix, 20);
          })(c = e.Loader || (e.Loader = {})), e.MathJax = a.MathJax, void 0 === e.MathJax.loader) {
            (0, a.combineDefaults)(e.MathJax.config, "loader", { paths: { mathjax: c.getRoot() }, source: {}, dependencies: {}, provides: {}, load: [], ready: c.defaultReady.bind(c), failed: function(t2) {
              return console.log("MathJax(".concat(t2.package || "?", "): ").concat(t2.message));
            }, require: null, pathFilters: [], versionWarnings: true }), (0, a.combineWithMathJax)({ loader: c });
            try {
              for (var p = i(e.MathJax.config.loader.pathFilters), f = p.next(); !f.done; f = p.next()) {
                var h = f.value;
                Array.isArray(h) ? c.pathFilters.add(h[0], h[1]) : c.pathFilters.add(h);
              }
            } catch (t2) {
              n = { error: t2 };
            } finally {
              try {
                f && !f.done && (o = p.return) && o.call(p);
              } finally {
                if (n) throw n.error;
              }
            }
          }
          e.CONFIG = e.MathJax.config.loader;
        }, 265: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, a = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, s = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.Package = e.PackageError = void 0;
          var l = r(235), c = (function(t2) {
            function e2(e3, r2) {
              var n2 = t2.call(this, e3) || this;
              return n2.package = r2, n2;
            }
            return o(e2, t2), e2;
          })(Error);
          e.PackageError = c;
          var u = (function() {
            function t2(e2, r2) {
              void 0 === r2 && (r2 = false), this.isLoaded = false, this.isLoading = false, this.hasFailed = false, this.dependents = [], this.dependencies = [], this.dependencyCount = 0, this.provided = [], this.name = e2, this.noLoad = r2, t2.packages.set(e2, this), this.promise = this.makePromise(this.makeDependencies());
            }
            return Object.defineProperty(t2.prototype, "canLoad", { get: function() {
              return 0 === this.dependencyCount && !this.noLoad && !this.isLoading && !this.hasFailed;
            }, enumerable: false, configurable: true }), t2.resolvePath = function(t3, e2) {
              void 0 === e2 && (e2 = true);
              var r2 = { name: t3, original: t3, addExtension: e2 };
              return l.Loader.pathFilters.execute(r2), r2.name;
            }, t2.loadAll = function() {
              var t3, e2;
              try {
                for (var r2 = i(this.packages.values()), n2 = r2.next(); !n2.done; n2 = r2.next()) {
                  var o2 = n2.value;
                  o2.canLoad && o2.load();
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  n2 && !n2.done && (e2 = r2.return) && e2.call(r2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
            }, t2.prototype.makeDependencies = function() {
              var e2, r2, n2 = [], o2 = t2.packages, c2 = this.noLoad, u2 = this.name, p = [];
              l.CONFIG.dependencies.hasOwnProperty(u2) ? p.push.apply(p, s([], a(l.CONFIG.dependencies[u2]), false)) : "core" !== u2 && p.push("core");
              try {
                for (var f = i(p), h = f.next(); !h.done; h = f.next()) {
                  var d = h.value, y = o2.get(d) || new t2(d, c2);
                  this.dependencies.indexOf(y) < 0 && (y.addDependent(this, c2), this.dependencies.push(y), y.isLoaded || (this.dependencyCount++, n2.push(y.promise)));
                }
              } catch (t3) {
                e2 = { error: t3 };
              } finally {
                try {
                  h && !h.done && (r2 = f.return) && r2.call(f);
                } finally {
                  if (e2) throw e2.error;
                }
              }
              return n2;
            }, t2.prototype.makePromise = function(t3) {
              var e2 = this, r2 = new Promise((function(t4, r3) {
                e2.resolve = t4, e2.reject = r3;
              })), n2 = l.CONFIG[this.name] || {};
              return n2.ready && (r2 = r2.then((function(t4) {
                return n2.ready(e2.name);
              }))), t3.length && (t3.push(r2), r2 = Promise.all(t3).then((function(t4) {
                return t4.join(", ");
              }))), n2.failed && r2.catch((function(t4) {
                return n2.failed(new c(t4, e2.name));
              })), r2;
            }, t2.prototype.load = function() {
              if (!this.isLoaded && !this.isLoading && !this.noLoad) {
                this.isLoading = true;
                var e2 = t2.resolvePath(this.name);
                l.CONFIG.require ? this.loadCustom(e2) : this.loadScript(e2);
              }
            }, t2.prototype.loadCustom = function(t3) {
              var e2 = this;
              try {
                var r2 = l.CONFIG.require(t3);
                r2 instanceof Promise ? r2.then((function() {
                  return e2.checkLoad();
                })).catch((function(r3) {
                  return e2.failed(`Can't load "` + t3 + '"\n' + r3.message.trim());
                })) : this.checkLoad();
              } catch (t4) {
                this.failed(t4.message);
              }
            }, t2.prototype.loadScript = function(t3) {
              var e2 = this, r2 = document.createElement("script");
              r2.src = t3, r2.charset = "UTF-8", r2.onload = function(t4) {
                return e2.checkLoad();
              }, r2.onerror = function(r3) {
                return e2.failed(`Can't load "` + t3 + '"');
              }, document.head.appendChild(r2);
            }, t2.prototype.loaded = function() {
              var t3, e2, r2, n2;
              this.isLoaded = true, this.isLoading = false;
              try {
                for (var o2 = i(this.dependents), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  a2.value.requirementSatisfied();
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  a2 && !a2.done && (e2 = o2.return) && e2.call(o2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              try {
                for (var s2 = i(this.provided), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                  l2.value.loaded();
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  l2 && !l2.done && (n2 = s2.return) && n2.call(s2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              this.resolve(this.name);
            }, t2.prototype.failed = function(t3) {
              this.hasFailed = true, this.isLoading = false, this.reject(new c(t3, this.name));
            }, t2.prototype.checkLoad = function() {
              var t3 = this;
              ((l.CONFIG[this.name] || {}).checkReady || function() {
                return Promise.resolve();
              })().then((function() {
                return t3.loaded();
              })).catch((function(e2) {
                return t3.failed(e2);
              }));
            }, t2.prototype.requirementSatisfied = function() {
              this.dependencyCount && (this.dependencyCount--, this.canLoad && this.load());
            }, t2.prototype.provides = function(e2) {
              var r2, n2;
              void 0 === e2 && (e2 = []);
              try {
                for (var o2 = i(e2), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  var s2 = a2.value, c2 = t2.packages.get(s2);
                  c2 || (l.CONFIG.dependencies[s2] || (l.CONFIG.dependencies[s2] = []), l.CONFIG.dependencies[s2].push(s2), (c2 = new t2(s2, true)).isLoading = true), this.provided.push(c2);
                }
              } catch (t3) {
                r2 = { error: t3 };
              } finally {
                try {
                  a2 && !a2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
            }, t2.prototype.addDependent = function(t3, e2) {
              this.dependents.push(t3), e2 || this.checkNoLoad();
            }, t2.prototype.checkNoLoad = function() {
              var t3, e2;
              if (this.noLoad) {
                this.noLoad = false;
                try {
                  for (var r2 = i(this.dependencies), n2 = r2.next(); !n2.done; n2 = r2.next()) {
                    n2.value.checkNoLoad();
                  }
                } catch (e3) {
                  t3 = { error: e3 };
                } finally {
                  try {
                    n2 && !n2.done && (e2 = r2.return) && e2.call(r2);
                  } finally {
                    if (t3) throw t3.error;
                  }
                }
              }
            }, t2.packages = /* @__PURE__ */ new Map(), t2;
          })();
          e.Package = u;
        }, 2388: function(t, e, r) {
          var n = this && this.__assign || function() {
            return n = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, n.apply(this, arguments);
          }, o = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, i = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, a = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.CONFIG = e.MathJax = e.Startup = void 0;
          var s, l = r(9515), c = r(8666), u = r(7233);
          !(function(t2) {
            var s2, l2, u2 = new c.PrioritizedList();
            function f(e2) {
              return s2.visitTree(e2, t2.document);
            }
            function h() {
              s2 = new e.MathJax._.core.MmlTree.SerializedMmlVisitor.SerializedMmlVisitor(), l2 = e.MathJax._.mathjax.mathjax, t2.input = M(), t2.output = b(), t2.adaptor = E(), t2.handler && l2.handlers.unregister(t2.handler), t2.handler = g(), t2.handler && (l2.handlers.register(t2.handler), t2.document = L());
            }
            function d() {
              var e2, r2;
              t2.input && t2.output && y();
              var n2 = t2.output ? t2.output.name.toLowerCase() : "";
              try {
                for (var i2 = o(t2.input), a2 = i2.next(); !a2.done; a2 = i2.next()) {
                  var s3 = a2.value, l3 = s3.name.toLowerCase();
                  m(l3, s3), v(l3, s3), t2.output && O(l3, n2, s3);
                }
              } catch (t3) {
                e2 = { error: t3 };
              } finally {
                try {
                  a2 && !a2.done && (r2 = i2.return) && r2.call(i2);
                } finally {
                  if (e2) throw e2.error;
                }
              }
            }
            function y() {
              e.MathJax.typeset = function(e2) {
                void 0 === e2 && (e2 = null), t2.document.options.elements = e2, t2.document.reset(), t2.document.render();
              }, e.MathJax.typesetPromise = function(e2) {
                return void 0 === e2 && (e2 = null), t2.document.options.elements = e2, t2.document.reset(), l2.handleRetriesFor((function() {
                  t2.document.render();
                }));
              }, e.MathJax.typesetClear = function(e2) {
                void 0 === e2 && (e2 = null), e2 ? t2.document.clearMathItemsWithin(e2) : t2.document.clear();
              };
            }
            function O(r2, n2, o2) {
              var i2 = r2 + "2" + n2;
              e.MathJax[i2] = function(e2, r3) {
                return void 0 === r3 && (r3 = {}), r3.format = o2.name, t2.document.convert(e2, r3);
              }, e.MathJax[i2 + "Promise"] = function(e2, r3) {
                return void 0 === r3 && (r3 = {}), r3.format = o2.name, l2.handleRetriesFor((function() {
                  return t2.document.convert(e2, r3);
                }));
              }, e.MathJax[n2 + "Stylesheet"] = function() {
                return t2.output.styleSheet(t2.document);
              }, "getMetricsFor" in t2.output && (e.MathJax.getMetricsFor = function(e2, r3) {
                return t2.output.getMetricsFor(e2, r3);
              });
            }
            function m(r2, n2) {
              var o2 = e.MathJax._.core.MathItem.STATE;
              e.MathJax[r2 + "2mml"] = function(e2, r3) {
                return void 0 === r3 && (r3 = {}), r3.end = o2.CONVERT, r3.format = n2.name, f(t2.document.convert(e2, r3));
              }, e.MathJax[r2 + "2mmlPromise"] = function(e2, r3) {
                return void 0 === r3 && (r3 = {}), r3.end = o2.CONVERT, r3.format = n2.name, l2.handleRetriesFor((function() {
                  return f(t2.document.convert(e2, r3));
                }));
              };
            }
            function v(t3, r2) {
              e.MathJax[t3 + "Reset"] = function() {
                for (var t4 = [], e2 = 0; e2 < arguments.length; e2++) t4[e2] = arguments[e2];
                return r2.reset.apply(r2, a([], i(t4), false));
              };
            }
            function M() {
              var r2, n2, i2 = [];
              try {
                for (var a2 = o(e.CONFIG.input), s3 = a2.next(); !s3.done; s3 = a2.next()) {
                  var l3 = s3.value, c2 = t2.constructors[l3];
                  if (!c2) throw Error('Input Jax "' + l3 + '" is not defined (has it been loaded?)');
                  i2.push(new c2(e.MathJax.config[l3]));
                }
              } catch (t3) {
                r2 = { error: t3 };
              } finally {
                try {
                  s3 && !s3.done && (n2 = a2.return) && n2.call(a2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return i2;
            }
            function b() {
              var r2 = e.CONFIG.output;
              if (!r2) return null;
              var n2 = t2.constructors[r2];
              if (!n2) throw Error('Output Jax "' + r2 + '" is not defined (has it been loaded?)');
              return new n2(e.MathJax.config[r2]);
            }
            function E() {
              var r2 = e.CONFIG.adaptor;
              if (!r2 || "none" === r2) return null;
              var n2 = t2.constructors[r2];
              if (!n2) throw Error('DOMAdaptor "' + r2 + '" is not defined (has it been loaded?)');
              return n2(e.MathJax.config[r2]);
            }
            function g() {
              var r2, n2, i2 = e.CONFIG.handler;
              if (!i2 || "none" === i2 || !t2.adaptor) return null;
              var a2 = t2.constructors[i2];
              if (!a2) throw Error('Handler "' + i2 + '" is not defined (has it been loaded?)');
              var s3 = new a2(t2.adaptor, 5);
              try {
                for (var l3 = o(u2), c2 = l3.next(); !c2.done; c2 = l3.next()) {
                  s3 = c2.value.item(s3);
                }
              } catch (t3) {
                r2 = { error: t3 };
              } finally {
                try {
                  c2 && !c2.done && (n2 = l3.return) && n2.call(l3);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return s3;
            }
            function L(r2) {
              return void 0 === r2 && (r2 = null), l2.document(r2 || e.CONFIG.document, n(n({}, e.MathJax.config.options), { InputJax: t2.input, OutputJax: t2.output }));
            }
            t2.constructors = {}, t2.input = [], t2.output = null, t2.handler = null, t2.adaptor = null, t2.elements = null, t2.document = null, t2.promise = new Promise((function(e2, r2) {
              t2.promiseResolve = e2, t2.promiseReject = r2;
            })), t2.pagePromise = new Promise((function(t3, e2) {
              var n2 = r.g.document;
              if (n2 && n2.readyState && "complete" !== n2.readyState && "interactive" !== n2.readyState) {
                var o2 = function() {
                  return t3();
                };
                n2.defaultView.addEventListener("load", o2, true), n2.defaultView.addEventListener("DOMContentLoaded", o2, true);
              } else t3();
            })), t2.toMML = f, t2.registerConstructor = function(e2, r2) {
              t2.constructors[e2] = r2;
            }, t2.useHandler = function(t3, r2) {
              void 0 === r2 && (r2 = false), e.CONFIG.handler && !r2 || (e.CONFIG.handler = t3);
            }, t2.useAdaptor = function(t3, r2) {
              void 0 === r2 && (r2 = false), e.CONFIG.adaptor && !r2 || (e.CONFIG.adaptor = t3);
            }, t2.useInput = function(t3, r2) {
              void 0 === r2 && (r2 = false), p && !r2 || e.CONFIG.input.push(t3);
            }, t2.useOutput = function(t3, r2) {
              void 0 === r2 && (r2 = false), e.CONFIG.output && !r2 || (e.CONFIG.output = t3);
            }, t2.extendHandler = function(t3, e2) {
              void 0 === e2 && (e2 = 10), u2.add(t3, e2);
            }, t2.defaultReady = function() {
              h(), d(), t2.pagePromise.then((function() {
                return e.CONFIG.pageReady();
              })).then((function() {
                return t2.promiseResolve();
              })).catch((function(e2) {
                return t2.promiseReject(e2);
              }));
            }, t2.defaultPageReady = function() {
              return e.CONFIG.typeset && e.MathJax.typesetPromise ? e.MathJax.typesetPromise(e.CONFIG.elements) : Promise.resolve();
            }, t2.getComponents = h, t2.makeMethods = d, t2.makeTypesetMethods = y, t2.makeOutputMethods = O, t2.makeMmlMethods = m, t2.makeResetMethod = v, t2.getInputJax = M, t2.getOutputJax = b, t2.getAdaptor = E, t2.getHandler = g, t2.getDocument = L;
          })(s = e.Startup || (e.Startup = {})), e.MathJax = l.MathJax, void 0 === e.MathJax._.startup && ((0, l.combineDefaults)(e.MathJax.config, "startup", { input: [], output: "", handler: null, adaptor: null, document: "undefined" == typeof document ? "" : document, elements: null, typeset: true, ready: s.defaultReady.bind(s), pageReady: s.defaultPageReady.bind(s) }), (0, l.combineWithMathJax)({ startup: s, options: {} }), e.MathJax.config.startup.invalidOption && (u.OPTIONS.invalidOption = e.MathJax.config.startup.invalidOption), e.MathJax.config.startup.optionError && (u.OPTIONS.optionError = e.MathJax.config.startup.optionError)), e.CONFIG = e.MathJax.config.startup;
          var p = 0 !== e.CONFIG.input.length;
        }, 3282: function(t, e) {
          Object.defineProperty(e, "__esModule", { value: true }), e.VERSION = void 0, e.VERSION = "3.2.2";
        }, 5009: function(t, e) {
          var r = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractDOMAdaptor = void 0;
          var n = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = null), this.document = t3;
            }
            return t2.prototype.node = function(t3, e2, n2, o) {
              var i, a;
              void 0 === e2 && (e2 = {}), void 0 === n2 && (n2 = []);
              var s = this.create(t3, o);
              this.setAttributes(s, e2);
              try {
                for (var l = r(n2), c = l.next(); !c.done; c = l.next()) {
                  var u = c.value;
                  this.append(s, u);
                }
              } catch (t4) {
                i = { error: t4 };
              } finally {
                try {
                  c && !c.done && (a = l.return) && a.call(l);
                } finally {
                  if (i) throw i.error;
                }
              }
              return s;
            }, t2.prototype.setAttributes = function(t3, e2) {
              var n2, o, i, a, s, l;
              if (e2.style && "string" != typeof e2.style) try {
                for (var c = r(Object.keys(e2.style)), u = c.next(); !u.done; u = c.next()) {
                  var p = u.value;
                  this.setStyle(t3, p.replace(/-([a-z])/g, (function(t4, e3) {
                    return e3.toUpperCase();
                  })), e2.style[p]);
                }
              } catch (t4) {
                n2 = { error: t4 };
              } finally {
                try {
                  u && !u.done && (o = c.return) && o.call(c);
                } finally {
                  if (n2) throw n2.error;
                }
              }
              if (e2.properties) try {
                for (var f = r(Object.keys(e2.properties)), h = f.next(); !h.done; h = f.next()) {
                  t3[p = h.value] = e2.properties[p];
                }
              } catch (t4) {
                i = { error: t4 };
              } finally {
                try {
                  h && !h.done && (a = f.return) && a.call(f);
                } finally {
                  if (i) throw i.error;
                }
              }
              try {
                for (var d = r(Object.keys(e2)), y = d.next(); !y.done; y = d.next()) {
                  "style" === (p = y.value) && "string" != typeof e2.style || "properties" === p || this.setAttribute(t3, p, e2[p]);
                }
              } catch (t4) {
                s = { error: t4 };
              } finally {
                try {
                  y && !y.done && (l = d.return) && l.call(d);
                } finally {
                  if (s) throw s.error;
                }
              }
            }, t2.prototype.replace = function(t3, e2) {
              return this.insert(t3, e2), this.remove(e2), e2;
            }, t2.prototype.childNode = function(t3, e2) {
              return this.childNodes(t3)[e2];
            }, t2.prototype.allClasses = function(t3) {
              var e2 = this.getAttribute(t3, "class");
              return e2 ? e2.replace(/  +/g, " ").replace(/^ /, "").replace(/ $/, "").split(/ /) : [];
            }, t2;
          })();
          e.AbstractDOMAdaptor = n;
        }, 3494: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractFindMath = void 0;
          var n = r(7233), o = (function() {
            function t2(t3) {
              var e2 = this.constructor;
              this.options = (0, n.userOptions)((0, n.defaultOptions)({}, e2.OPTIONS), t3);
            }
            return t2.OPTIONS = {}, t2;
          })();
          e.AbstractFindMath = o;
        }, 3670: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractHandler = void 0;
          var i = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2;
          })(r(5722).AbstractMathDocument), a = (function() {
            function t2(t3, e2) {
              void 0 === e2 && (e2 = 5), this.documentClass = i, this.adaptor = t3, this.priority = e2;
            }
            return Object.defineProperty(t2.prototype, "name", { get: function() {
              return this.constructor.NAME;
            }, enumerable: false, configurable: true }), t2.prototype.handlesDocument = function(t3) {
              return false;
            }, t2.prototype.create = function(t3, e2) {
              return new this.documentClass(t3, this.adaptor, e2);
            }, t2.NAME = "generic", t2;
          })();
          e.AbstractHandler = a;
        }, 805: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.HandlerList = void 0;
          var a = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.prototype.register = function(t3) {
              return this.add(t3, t3.priority);
            }, e2.prototype.unregister = function(t3) {
              this.remove(t3);
            }, e2.prototype.handlesDocument = function(t3) {
              var e3, r2;
              try {
                for (var n2 = i(this), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  var a2 = o2.value.item;
                  if (a2.handlesDocument(t3)) return a2;
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r2 = n2.return) && r2.call(n2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              throw new Error("Can't find handler for document");
            }, e2.prototype.document = function(t3, e3) {
              return void 0 === e3 && (e3 = null), this.handlesDocument(t3).create(t3, e3);
            }, e2;
          })(r(8666).PrioritizedList);
          e.HandlerList = a;
        }, 9206: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractInputJax = void 0;
          var n = r(7233), o = r(7525), i = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = {}), this.adaptor = null, this.mmlFactory = null;
              var e2 = this.constructor;
              this.options = (0, n.userOptions)((0, n.defaultOptions)({}, e2.OPTIONS), t3), this.preFilters = new o.FunctionList(), this.postFilters = new o.FunctionList();
            }
            return Object.defineProperty(t2.prototype, "name", { get: function() {
              return this.constructor.NAME;
            }, enumerable: false, configurable: true }), t2.prototype.setAdaptor = function(t3) {
              this.adaptor = t3;
            }, t2.prototype.setMmlFactory = function(t3) {
              this.mmlFactory = t3;
            }, t2.prototype.initialize = function() {
            }, t2.prototype.reset = function() {
              for (var t3 = [], e2 = 0; e2 < arguments.length; e2++) t3[e2] = arguments[e2];
            }, Object.defineProperty(t2.prototype, "processStrings", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), t2.prototype.findMath = function(t3, e2) {
              return [];
            }, t2.prototype.executeFilters = function(t3, e2, r2, n2) {
              var o2 = { math: e2, document: r2, data: n2 };
              return t3.execute(o2), o2.data;
            }, t2.NAME = "generic", t2.OPTIONS = {}, t2;
          })();
          e.AbstractInputJax = i;
        }, 5722: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, a = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, s = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractMathDocument = e.resetAllOptions = e.resetOptions = e.RenderList = void 0;
          var l = r(7233), c = r(9206), u = r(2975), p = r(9e3), f = r(4474), h = r(3909), d = r(6751), y = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.create = function(t3) {
              var e3, r2, n2 = new this();
              try {
                for (var o2 = i(Object.keys(t3)), s2 = o2.next(); !s2.done; s2 = o2.next()) {
                  var l2 = s2.value, c2 = a(this.action(l2, t3[l2]), 2), u2 = c2[0], p2 = c2[1];
                  p2 && n2.add(u2, p2);
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  s2 && !s2.done && (r2 = o2.return) && r2.call(o2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              return n2;
            }, e2.action = function(t3, e3) {
              var r2, n2, o2, i2, s2, l2, c2 = true, u2 = e3[0];
              if (1 === e3.length || "boolean" == typeof e3[1]) 2 === e3.length && (c2 = e3[1]), s2 = (r2 = a(this.methodActions(t3), 2))[0], l2 = r2[1];
              else if ("string" == typeof e3[1]) if ("string" == typeof e3[2]) {
                4 === e3.length && (c2 = e3[3]);
                var p2 = a(e3.slice(1), 2), f2 = p2[0], h2 = p2[1];
                s2 = (n2 = a(this.methodActions(f2, h2), 2))[0], l2 = n2[1];
              } else 3 === e3.length && (c2 = e3[2]), s2 = (o2 = a(this.methodActions(e3[1]), 2))[0], l2 = o2[1];
              else 4 === e3.length && (c2 = e3[3]), s2 = (i2 = a(e3.slice(1), 2))[0], l2 = i2[1];
              return [{ id: t3, renderDoc: s2, renderMath: l2, convert: c2 }, u2];
            }, e2.methodActions = function(t3, e3) {
              return void 0 === e3 && (e3 = t3), [function(e4) {
                return t3 && e4[t3](), false;
              }, function(t4, r2) {
                return e3 && t4[e3](r2), false;
              }];
            }, e2.prototype.renderDoc = function(t3, e3) {
              var r2, n2;
              void 0 === e3 && (e3 = f.STATE.UNPROCESSED);
              try {
                for (var o2 = i(this.items), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  var s2 = a2.value;
                  if (s2.priority >= e3 && s2.item.renderDoc(t3)) return;
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  a2 && !a2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
            }, e2.prototype.renderMath = function(t3, e3, r2) {
              var n2, o2;
              void 0 === r2 && (r2 = f.STATE.UNPROCESSED);
              try {
                for (var a2 = i(this.items), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                  var l2 = s2.value;
                  if (l2.priority >= r2 && l2.item.renderMath(t3, e3)) return;
                }
              } catch (t4) {
                n2 = { error: t4 };
              } finally {
                try {
                  s2 && !s2.done && (o2 = a2.return) && o2.call(a2);
                } finally {
                  if (n2) throw n2.error;
                }
              }
            }, e2.prototype.renderConvert = function(t3, e3, r2) {
              var n2, o2;
              void 0 === r2 && (r2 = f.STATE.LAST);
              try {
                for (var a2 = i(this.items), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                  var l2 = s2.value;
                  if (l2.priority > r2) return;
                  if (l2.item.convert && l2.item.renderMath(t3, e3)) return;
                }
              } catch (t4) {
                n2 = { error: t4 };
              } finally {
                try {
                  s2 && !s2.done && (o2 = a2.return) && o2.call(a2);
                } finally {
                  if (n2) throw n2.error;
                }
              }
            }, e2.prototype.findID = function(t3) {
              var e3, r2;
              try {
                for (var n2 = i(this.items), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  var a2 = o2.value;
                  if (a2.item.id === t3) return a2.item;
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r2 = n2.return) && r2.call(n2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              return null;
            }, e2;
          })(r(8666).PrioritizedList);
          e.RenderList = y, e.resetOptions = { all: false, processed: false, inputJax: null, outputJax: null }, e.resetAllOptions = { all: true, processed: true, inputJax: [], outputJax: [] };
          var O = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.prototype.compile = function(t3) {
              return null;
            }, e2;
          })(c.AbstractInputJax), m = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.prototype.typeset = function(t3, e3) {
              return void 0 === e3 && (e3 = null), null;
            }, e2.prototype.escaped = function(t3, e3) {
              return null;
            }, e2;
          })(u.AbstractOutputJax), v = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2;
          })(p.AbstractMathList), M = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2;
          })(f.AbstractMathItem), b = (function() {
            function t2(e2, r2, n2) {
              var o2 = this, i2 = this.constructor;
              this.document = e2, this.options = (0, l.userOptions)((0, l.defaultOptions)({}, i2.OPTIONS), n2), this.math = new (this.options.MathList || v)(), this.renderActions = y.create(this.options.renderActions), this.processed = new t2.ProcessBits(), this.outputJax = this.options.OutputJax || new m();
              var a2 = this.options.InputJax || [new O()];
              Array.isArray(a2) || (a2 = [a2]), this.inputJax = a2, this.adaptor = r2, this.outputJax.setAdaptor(r2), this.inputJax.map((function(t3) {
                return t3.setAdaptor(r2);
              })), this.mmlFactory = this.options.MmlFactory || new h.MmlFactory(), this.inputJax.map((function(t3) {
                return t3.setMmlFactory(o2.mmlFactory);
              })), this.outputJax.initialize(), this.inputJax.map((function(t3) {
                return t3.initialize();
              }));
            }
            return Object.defineProperty(t2.prototype, "kind", { get: function() {
              return this.constructor.KIND;
            }, enumerable: false, configurable: true }), t2.prototype.addRenderAction = function(t3) {
              for (var e2 = [], r2 = 1; r2 < arguments.length; r2++) e2[r2 - 1] = arguments[r2];
              var n2 = a(y.action(t3, e2), 2), o2 = n2[0], i2 = n2[1];
              this.renderActions.add(o2, i2);
            }, t2.prototype.removeRenderAction = function(t3) {
              var e2 = this.renderActions.findID(t3);
              e2 && this.renderActions.remove(e2);
            }, t2.prototype.render = function() {
              return this.renderActions.renderDoc(this), this;
            }, t2.prototype.rerender = function(t3) {
              return void 0 === t3 && (t3 = f.STATE.RERENDER), this.state(t3 - 1), this.render(), this;
            }, t2.prototype.convert = function(t3, e2) {
              void 0 === e2 && (e2 = {});
              var r2 = (0, l.userOptions)({ format: this.inputJax[0].name, display: true, end: f.STATE.LAST, em: 16, ex: 8, containerWidth: null, lineWidth: 1e6, scale: 1, family: "" }, e2), n2 = r2.format, o2 = r2.display, i2 = r2.end, a2 = r2.ex, s2 = r2.em, c2 = r2.containerWidth, u2 = r2.lineWidth, p2 = r2.scale, h2 = r2.family;
              null === c2 && (c2 = 80 * a2);
              var d2 = this.inputJax.reduce((function(t4, e3) {
                return e3.name === n2 ? e3 : t4;
              }), null), y2 = new this.options.MathItem(t3, d2, o2);
              return y2.start.node = this.adaptor.body(this.document), y2.setMetrics(s2, a2, c2, u2, p2), this.outputJax.options.mtextInheritFont && (y2.outputData.mtextFamily = h2), this.outputJax.options.merrorInheritFont && (y2.outputData.merrorFamily = h2), y2.convert(this, i2), y2.typesetRoot || y2.root;
            }, t2.prototype.findMath = function(t3) {
              return void 0 === t3 && (t3 = null), this.processed.set("findMath"), this;
            }, t2.prototype.compile = function() {
              var t3, e2, r2, n2;
              if (!this.processed.isSet("compile")) {
                var o2 = [];
                try {
                  for (var a2 = i(this.math), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                    var l2 = s2.value;
                    this.compileMath(l2), void 0 !== l2.inputData.recompile && o2.push(l2);
                  }
                } catch (e3) {
                  t3 = { error: e3 };
                } finally {
                  try {
                    s2 && !s2.done && (e2 = a2.return) && e2.call(a2);
                  } finally {
                    if (t3) throw t3.error;
                  }
                }
                try {
                  for (var c2 = i(o2), u2 = c2.next(); !u2.done; u2 = c2.next()) {
                    var p2 = (l2 = u2.value).inputData.recompile;
                    l2.state(p2.state), l2.inputData.recompile = p2, this.compileMath(l2);
                  }
                } catch (t4) {
                  r2 = { error: t4 };
                } finally {
                  try {
                    u2 && !u2.done && (n2 = c2.return) && n2.call(c2);
                  } finally {
                    if (r2) throw r2.error;
                  }
                }
                this.processed.set("compile");
              }
              return this;
            }, t2.prototype.compileMath = function(t3) {
              try {
                t3.compile(this);
              } catch (e2) {
                if (e2.retry || e2.restart) throw e2;
                this.options.compileError(this, t3, e2), t3.inputData.error = e2;
              }
            }, t2.prototype.compileError = function(t3, e2) {
              t3.root = this.mmlFactory.create("math", null, [this.mmlFactory.create("merror", { "data-mjx-error": e2.message, title: e2.message }, [this.mmlFactory.create("mtext", null, [this.mmlFactory.create("text").setText("Math input error")])])]), t3.display && t3.root.attributes.set("display", "block"), t3.inputData.error = e2.message;
            }, t2.prototype.typeset = function() {
              var t3, e2;
              if (!this.processed.isSet("typeset")) {
                try {
                  for (var r2 = i(this.math), n2 = r2.next(); !n2.done; n2 = r2.next()) {
                    var o2 = n2.value;
                    try {
                      o2.typeset(this);
                    } catch (t4) {
                      if (t4.retry || t4.restart) throw t4;
                      this.options.typesetError(this, o2, t4), o2.outputData.error = t4;
                    }
                  }
                } catch (e3) {
                  t3 = { error: e3 };
                } finally {
                  try {
                    n2 && !n2.done && (e2 = r2.return) && e2.call(r2);
                  } finally {
                    if (t3) throw t3.error;
                  }
                }
                this.processed.set("typeset");
              }
              return this;
            }, t2.prototype.typesetError = function(t3, e2) {
              t3.typesetRoot = this.adaptor.node("mjx-container", { class: "MathJax mjx-output-error", jax: this.outputJax.name }, [this.adaptor.node("span", { "data-mjx-error": e2.message, title: e2.message, style: { color: "red", "background-color": "yellow", "line-height": "normal" } }, [this.adaptor.text("Math output error")])]), t3.display && this.adaptor.setAttributes(t3.typesetRoot, { style: { display: "block", margin: "1em 0", "text-align": "center" } }), t3.outputData.error = e2.message;
            }, t2.prototype.getMetrics = function() {
              return this.processed.isSet("getMetrics") || (this.outputJax.getMetrics(this), this.processed.set("getMetrics")), this;
            }, t2.prototype.updateDocument = function() {
              var t3, e2;
              if (!this.processed.isSet("updateDocument")) {
                try {
                  for (var r2 = i(this.math.reversed()), n2 = r2.next(); !n2.done; n2 = r2.next()) {
                    n2.value.updateDocument(this);
                  }
                } catch (e3) {
                  t3 = { error: e3 };
                } finally {
                  try {
                    n2 && !n2.done && (e2 = r2.return) && e2.call(r2);
                  } finally {
                    if (t3) throw t3.error;
                  }
                }
                this.processed.set("updateDocument");
              }
              return this;
            }, t2.prototype.removeFromDocument = function(t3) {
              return void 0 === t3 && (t3 = false), this;
            }, t2.prototype.state = function(t3, e2) {
              var r2, n2;
              void 0 === e2 && (e2 = false);
              try {
                for (var o2 = i(this.math), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  a2.value.state(t3, e2);
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  a2 && !a2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return t3 < f.STATE.INSERTED && this.processed.clear("updateDocument"), t3 < f.STATE.TYPESET && (this.processed.clear("typeset"), this.processed.clear("getMetrics")), t3 < f.STATE.COMPILED && this.processed.clear("compile"), this;
            }, t2.prototype.reset = function(t3) {
              var r2;
              return void 0 === t3 && (t3 = { processed: true }), (t3 = (0, l.userOptions)(Object.assign({}, e.resetOptions), t3)).all && Object.assign(t3, e.resetAllOptions), t3.processed && this.processed.reset(), t3.inputJax && this.inputJax.forEach((function(e2) {
                return e2.reset.apply(e2, s([], a(t3.inputJax), false));
              })), t3.outputJax && (r2 = this.outputJax).reset.apply(r2, s([], a(t3.outputJax), false)), this;
            }, t2.prototype.clear = function() {
              return this.reset(), this.math.clear(), this;
            }, t2.prototype.concat = function(t3) {
              return this.math.merge(t3), this;
            }, t2.prototype.clearMathItemsWithin = function(t3) {
              var e2, r2 = this.getMathItemsWithin(t3);
              return (e2 = this.math).remove.apply(e2, s([], a(r2), false)), r2;
            }, t2.prototype.getMathItemsWithin = function(t3) {
              var e2, r2, n2, o2;
              Array.isArray(t3) || (t3 = [t3]);
              var a2 = this.adaptor, s2 = [], l2 = a2.getElements(t3, this.document);
              try {
                t: for (var c2 = i(this.math), u2 = c2.next(); !u2.done; u2 = c2.next()) {
                  var p2 = u2.value;
                  try {
                    for (var f2 = (n2 = void 0, i(l2)), h2 = f2.next(); !h2.done; h2 = f2.next()) {
                      var d2 = h2.value;
                      if (p2.start.node && a2.contains(d2, p2.start.node)) {
                        s2.push(p2);
                        continue t;
                      }
                    }
                  } catch (t4) {
                    n2 = { error: t4 };
                  } finally {
                    try {
                      h2 && !h2.done && (o2 = f2.return) && o2.call(f2);
                    } finally {
                      if (n2) throw n2.error;
                    }
                  }
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  u2 && !u2.done && (r2 = c2.return) && r2.call(c2);
                } finally {
                  if (e2) throw e2.error;
                }
              }
              return s2;
            }, t2.KIND = "MathDocument", t2.OPTIONS = { OutputJax: null, InputJax: null, MmlFactory: null, MathList: v, MathItem: M, compileError: function(t3, e2, r2) {
              t3.compileError(e2, r2);
            }, typesetError: function(t3, e2, r2) {
              t3.typesetError(e2, r2);
            }, renderActions: (0, l.expandable)({ find: [f.STATE.FINDMATH, "findMath", "", false], compile: [f.STATE.COMPILED], metrics: [f.STATE.METRICS, "getMetrics", "", false], typeset: [f.STATE.TYPESET], update: [f.STATE.INSERTED, "updateDocument", false] }) }, t2.ProcessBits = (0, d.BitFieldClass)("findMath", "compile", "getMetrics", "typeset", "updateDocument"), t2;
          })();
          e.AbstractMathDocument = b;
        }, 4474: function(t, e) {
          Object.defineProperty(e, "__esModule", { value: true }), e.newState = e.STATE = e.AbstractMathItem = e.protoItem = void 0, e.protoItem = function(t2, e2, r2, n, o, i, a) {
            return void 0 === a && (a = null), { open: t2, math: e2, close: r2, n, start: { n: o }, end: { n: i }, display: a };
          };
          var r = (function() {
            function t2(t3, r2, n, o, i) {
              void 0 === n && (n = true), void 0 === o && (o = { i: 0, n: 0, delim: "" }), void 0 === i && (i = { i: 0, n: 0, delim: "" }), this.root = null, this.typesetRoot = null, this.metrics = {}, this.inputData = {}, this.outputData = {}, this._state = e.STATE.UNPROCESSED, this.math = t3, this.inputJax = r2, this.display = n, this.start = o, this.end = i, this.root = null, this.typesetRoot = null, this.metrics = {}, this.inputData = {}, this.outputData = {};
            }
            return Object.defineProperty(t2.prototype, "isEscaped", { get: function() {
              return null === this.display;
            }, enumerable: false, configurable: true }), t2.prototype.render = function(t3) {
              t3.renderActions.renderMath(this, t3);
            }, t2.prototype.rerender = function(t3, r2) {
              void 0 === r2 && (r2 = e.STATE.RERENDER), this.state() >= r2 && this.state(r2 - 1), t3.renderActions.renderMath(this, t3, r2);
            }, t2.prototype.convert = function(t3, r2) {
              void 0 === r2 && (r2 = e.STATE.LAST), t3.renderActions.renderConvert(this, t3, r2);
            }, t2.prototype.compile = function(t3) {
              this.state() < e.STATE.COMPILED && (this.root = this.inputJax.compile(this, t3), this.state(e.STATE.COMPILED));
            }, t2.prototype.typeset = function(t3) {
              this.state() < e.STATE.TYPESET && (this.typesetRoot = t3.outputJax[this.isEscaped ? "escaped" : "typeset"](this, t3), this.state(e.STATE.TYPESET));
            }, t2.prototype.updateDocument = function(t3) {
            }, t2.prototype.removeFromDocument = function(t3) {
              void 0 === t3 && (t3 = false);
            }, t2.prototype.setMetrics = function(t3, e2, r2, n, o) {
              this.metrics = { em: t3, ex: e2, containerWidth: r2, lineWidth: n, scale: o };
            }, t2.prototype.state = function(t3, r2) {
              return void 0 === t3 && (t3 = null), void 0 === r2 && (r2 = false), null != t3 && (t3 < e.STATE.INSERTED && this._state >= e.STATE.INSERTED && this.removeFromDocument(r2), t3 < e.STATE.TYPESET && this._state >= e.STATE.TYPESET && (this.outputData = {}), t3 < e.STATE.COMPILED && this._state >= e.STATE.COMPILED && (this.inputData = {}), this._state = t3), this._state;
            }, t2.prototype.reset = function(t3) {
              void 0 === t3 && (t3 = false), this.state(e.STATE.UNPROCESSED, t3);
            }, t2;
          })();
          e.AbstractMathItem = r, e.STATE = { UNPROCESSED: 0, FINDMATH: 10, COMPILED: 20, CONVERT: 100, METRICS: 110, RERENDER: 125, TYPESET: 150, INSERTED: 200, LAST: 1e4 }, e.newState = function(t2, r2) {
            if (t2 in e.STATE) throw Error("State " + t2 + " already exists");
            e.STATE[t2] = r2;
          };
        }, 9e3: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractMathList = void 0;
          var i = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.prototype.isBefore = function(t3, e3) {
              return t3.start.i < e3.start.i || t3.start.i === e3.start.i && t3.start.n < e3.start.n;
            }, e2;
          })(r(103).LinkedList);
          e.AbstractMathList = i;
        }, 91: function(t, e) {
          var r = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.Attributes = e.INHERIT = void 0, e.INHERIT = "_inherit_";
          var n = (function() {
            function t2(t3, e2) {
              this.global = e2, this.defaults = Object.create(e2), this.inherited = Object.create(this.defaults), this.attributes = Object.create(this.inherited), Object.assign(this.defaults, t3);
            }
            return t2.prototype.set = function(t3, e2) {
              this.attributes[t3] = e2;
            }, t2.prototype.setList = function(t3) {
              Object.assign(this.attributes, t3);
            }, t2.prototype.get = function(t3) {
              var r2 = this.attributes[t3];
              return r2 === e.INHERIT && (r2 = this.global[t3]), r2;
            }, t2.prototype.getExplicit = function(t3) {
              if (this.attributes.hasOwnProperty(t3)) return this.attributes[t3];
            }, t2.prototype.getList = function() {
              for (var t3, e2, n2 = [], o = 0; o < arguments.length; o++) n2[o] = arguments[o];
              var i = {};
              try {
                for (var a = r(n2), s = a.next(); !s.done; s = a.next()) {
                  var l = s.value;
                  i[l] = this.get(l);
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  s && !s.done && (e2 = a.return) && e2.call(a);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return i;
            }, t2.prototype.setInherited = function(t3, e2) {
              this.inherited[t3] = e2;
            }, t2.prototype.getInherited = function(t3) {
              return this.inherited[t3];
            }, t2.prototype.getDefault = function(t3) {
              return this.defaults[t3];
            }, t2.prototype.isSet = function(t3) {
              return this.attributes.hasOwnProperty(t3) || this.inherited.hasOwnProperty(t3);
            }, t2.prototype.hasDefault = function(t3) {
              return t3 in this.defaults;
            }, t2.prototype.getExplicitNames = function() {
              return Object.keys(this.attributes);
            }, t2.prototype.getInheritedNames = function() {
              return Object.keys(this.inherited);
            }, t2.prototype.getDefaultNames = function() {
              return Object.keys(this.defaults);
            }, t2.prototype.getGlobalNames = function() {
              return Object.keys(this.global);
            }, t2.prototype.getAllAttributes = function() {
              return this.attributes;
            }, t2.prototype.getAllInherited = function() {
              return this.inherited;
            }, t2.prototype.getAllDefaults = function() {
              return this.defaults;
            }, t2.prototype.getAllGlobals = function() {
              return this.global;
            }, t2;
          })();
          e.Attributes = n;
        }, 6336: function(t, e, r) {
          var n;
          Object.defineProperty(e, "__esModule", { value: true }), e.MML = void 0;
          var o = r(9007), i = r(3233), a = r(450), s = r(3050), l = r(2756), c = r(4770), u = r(6030), p = r(7265), f = r(9878), h = r(6850), d = r(7131), y = r(6145), O = r(1314), m = r(1581), v = r(7238), M = r(5741), b = r(5410), E = r(6661), g = r(9145), L = r(4461), x = r(5184), N = r(6405), _ = r(1349), T = r(5022), R = r(4359), A = r(142), S = r(7590), C = r(3985), w = r(9102), I = r(3948), P = r(1334);
          e.MML = ((n = {})[i.MmlMath.prototype.kind] = i.MmlMath, n[a.MmlMi.prototype.kind] = a.MmlMi, n[s.MmlMn.prototype.kind] = s.MmlMn, n[l.MmlMo.prototype.kind] = l.MmlMo, n[c.MmlMtext.prototype.kind] = c.MmlMtext, n[u.MmlMspace.prototype.kind] = u.MmlMspace, n[p.MmlMs.prototype.kind] = p.MmlMs, n[f.MmlMrow.prototype.kind] = f.MmlMrow, n[f.MmlInferredMrow.prototype.kind] = f.MmlInferredMrow, n[h.MmlMfrac.prototype.kind] = h.MmlMfrac, n[d.MmlMsqrt.prototype.kind] = d.MmlMsqrt, n[y.MmlMroot.prototype.kind] = y.MmlMroot, n[O.MmlMstyle.prototype.kind] = O.MmlMstyle, n[m.MmlMerror.prototype.kind] = m.MmlMerror, n[v.MmlMpadded.prototype.kind] = v.MmlMpadded, n[M.MmlMphantom.prototype.kind] = M.MmlMphantom, n[b.MmlMfenced.prototype.kind] = b.MmlMfenced, n[E.MmlMenclose.prototype.kind] = E.MmlMenclose, n[g.MmlMaction.prototype.kind] = g.MmlMaction, n[L.MmlMsub.prototype.kind] = L.MmlMsub, n[L.MmlMsup.prototype.kind] = L.MmlMsup, n[L.MmlMsubsup.prototype.kind] = L.MmlMsubsup, n[x.MmlMunder.prototype.kind] = x.MmlMunder, n[x.MmlMover.prototype.kind] = x.MmlMover, n[x.MmlMunderover.prototype.kind] = x.MmlMunderover, n[N.MmlMmultiscripts.prototype.kind] = N.MmlMmultiscripts, n[N.MmlMprescripts.prototype.kind] = N.MmlMprescripts, n[N.MmlNone.prototype.kind] = N.MmlNone, n[_.MmlMtable.prototype.kind] = _.MmlMtable, n[T.MmlMlabeledtr.prototype.kind] = T.MmlMlabeledtr, n[T.MmlMtr.prototype.kind] = T.MmlMtr, n[R.MmlMtd.prototype.kind] = R.MmlMtd, n[A.MmlMaligngroup.prototype.kind] = A.MmlMaligngroup, n[S.MmlMalignmark.prototype.kind] = S.MmlMalignmark, n[C.MmlMglyph.prototype.kind] = C.MmlMglyph, n[w.MmlSemantics.prototype.kind] = w.MmlSemantics, n[w.MmlAnnotation.prototype.kind] = w.MmlAnnotation, n[w.MmlAnnotationXML.prototype.kind] = w.MmlAnnotationXML, n[I.TeXAtom.prototype.kind] = I.TeXAtom, n[P.MathChoice.prototype.kind] = P.MathChoice, n[o.TextNode.prototype.kind] = o.TextNode, n[o.XMLNode.prototype.kind] = o.XMLNode, n);
        }, 1759: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MathMLVisitor = void 0;
          var a = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.document = null, e3;
            }
            return o(e2, t2), e2.prototype.visitTree = function(t3, e3) {
              this.document = e3;
              var r2 = e3.createElement("top");
              return this.visitNode(t3, r2), this.document = null, r2.firstChild;
            }, e2.prototype.visitTextNode = function(t3, e3) {
              e3.appendChild(this.document.createTextNode(t3.getText()));
            }, e2.prototype.visitXMLNode = function(t3, e3) {
              e3.appendChild(t3.getXML().cloneNode(true));
            }, e2.prototype.visitInferredMrowNode = function(t3, e3) {
              var r2, n2;
              try {
                for (var o2 = i(t3.childNodes), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  var s = a2.value;
                  this.visitNode(s, e3);
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  a2 && !a2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
            }, e2.prototype.visitDefault = function(t3, e3) {
              var r2, n2, o2 = this.document.createElement(t3.kind);
              this.addAttributes(t3, o2);
              try {
                for (var a2 = i(t3.childNodes), s = a2.next(); !s.done; s = a2.next()) {
                  var l = s.value;
                  this.visitNode(l, o2);
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  s && !s.done && (n2 = a2.return) && n2.call(a2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              e3.appendChild(o2);
            }, e2.prototype.addAttributes = function(t3, e3) {
              var r2, n2, o2 = t3.attributes, a2 = o2.getExplicitNames();
              try {
                for (var s = i(a2), l = s.next(); !l.done; l = s.next()) {
                  var c = l.value;
                  e3.setAttribute(c, o2.getExplicit(c).toString());
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  l && !l.done && (n2 = s.return) && n2.call(s);
                } finally {
                  if (r2) throw r2.error;
                }
              }
            }, e2;
          })(r(6325).MmlVisitor);
          e.MathMLVisitor = a;
        }, 3909: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlFactory = void 0;
          var i = r(7860), a = r(6336), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "MML", { get: function() {
              return this.node;
            }, enumerable: false, configurable: true }), e2.defaultNodes = a.MML, e2;
          })(i.AbstractNodeFactory);
          e.MmlFactory = s;
        }, 9007: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, s = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.XMLNode = e.TextNode = e.AbstractMmlEmptyNode = e.AbstractMmlBaseNode = e.AbstractMmlLayoutNode = e.AbstractMmlTokenNode = e.AbstractMmlNode = e.indentAttributes = e.TEXCLASSNAMES = e.TEXCLASS = void 0;
          var l = r(91), c = r(4596);
          e.TEXCLASS = { ORD: 0, OP: 1, BIN: 2, REL: 3, OPEN: 4, CLOSE: 5, PUNCT: 6, INNER: 7, VCENTER: 8, NONE: -1 }, e.TEXCLASSNAMES = ["ORD", "OP", "BIN", "REL", "OPEN", "CLOSE", "PUNCT", "INNER", "VCENTER"];
          var u = ["", "thinmathspace", "mediummathspace", "thickmathspace"], p = [[0, -1, 2, 3, 0, 0, 0, 1], [-1, -1, 0, 3, 0, 0, 0, 1], [2, 2, 0, 0, 2, 0, 0, 2], [3, 3, 0, 0, 3, 0, 0, 3], [0, 0, 0, 0, 0, 0, 0, 0], [0, -1, 2, 3, 0, 0, 0, 1], [1, 1, 0, 1, 1, 1, 1, 1], [1, -1, 2, 3, 1, 0, 1, 1]];
          e.indentAttributes = ["indentalign", "indentalignfirst", "indentshift", "indentshiftfirst"];
          var f = (function(t2) {
            function r2(e2, r3, n2) {
              void 0 === r3 && (r3 = {}), void 0 === n2 && (n2 = []);
              var o2 = t2.call(this, e2) || this;
              return o2.prevClass = null, o2.prevLevel = null, o2.texclass = null, o2.arity < 0 && (o2.childNodes = [e2.create("inferredMrow")], o2.childNodes[0].parent = o2), o2.setChildren(n2), o2.attributes = new l.Attributes(e2.getNodeClass(o2.kind).defaults, e2.getNodeClass("math").defaults), o2.attributes.setList(r3), o2;
            }
            return o(r2, t2), r2.prototype.copy = function(t3) {
              var e2, r3, n2, o2;
              void 0 === t3 && (t3 = false);
              var s2 = this.factory.create(this.kind);
              if (s2.properties = i({}, this.properties), this.attributes) {
                var l2 = this.attributes.getAllAttributes();
                try {
                  for (var c2 = a(Object.keys(l2)), u2 = c2.next(); !u2.done; u2 = c2.next()) {
                    var p2 = u2.value;
                    ("id" !== p2 || t3) && s2.attributes.set(p2, l2[p2]);
                  }
                } catch (t4) {
                  e2 = { error: t4 };
                } finally {
                  try {
                    u2 && !u2.done && (r3 = c2.return) && r3.call(c2);
                  } finally {
                    if (e2) throw e2.error;
                  }
                }
              }
              if (this.childNodes && this.childNodes.length) {
                var f2 = this.childNodes;
                1 === f2.length && f2[0].isInferred && (f2 = f2[0].childNodes);
                try {
                  for (var h2 = a(f2), d2 = h2.next(); !d2.done; d2 = h2.next()) {
                    var y2 = d2.value;
                    y2 ? s2.appendChild(y2.copy()) : s2.childNodes.push(null);
                  }
                } catch (t4) {
                  n2 = { error: t4 };
                } finally {
                  try {
                    d2 && !d2.done && (o2 = h2.return) && o2.call(h2);
                  } finally {
                    if (n2) throw n2.error;
                  }
                }
              }
              return s2;
            }, Object.defineProperty(r2.prototype, "texClass", { get: function() {
              return this.texclass;
            }, set: function(t3) {
              this.texclass = t3;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "isToken", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "isEmbellished", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "isSpacelike", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "linebreakContainer", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "hasNewLine", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "arity", { get: function() {
              return 1 / 0;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "isInferred", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "Parent", { get: function() {
              for (var t3 = this.parent; t3 && t3.notParent; ) t3 = t3.Parent;
              return t3;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "notParent", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), r2.prototype.setChildren = function(e2) {
              return this.arity < 0 ? this.childNodes[0].setChildren(e2) : t2.prototype.setChildren.call(this, e2);
            }, r2.prototype.appendChild = function(e2) {
              var r3, n2, o2 = this;
              if (this.arity < 0) return this.childNodes[0].appendChild(e2), e2;
              if (e2.isInferred) {
                if (this.arity === 1 / 0) return e2.childNodes.forEach((function(e3) {
                  return t2.prototype.appendChild.call(o2, e3);
                })), e2;
                var i2 = e2;
                (e2 = this.factory.create("mrow")).setChildren(i2.childNodes), e2.attributes = i2.attributes;
                try {
                  for (var s2 = a(i2.getPropertyNames()), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                    var c2 = l2.value;
                    e2.setProperty(c2, i2.getProperty(c2));
                  }
                } catch (t3) {
                  r3 = { error: t3 };
                } finally {
                  try {
                    l2 && !l2.done && (n2 = s2.return) && n2.call(s2);
                  } finally {
                    if (r3) throw r3.error;
                  }
                }
              }
              return t2.prototype.appendChild.call(this, e2);
            }, r2.prototype.replaceChild = function(e2, r3) {
              return this.arity < 0 ? (this.childNodes[0].replaceChild(e2, r3), e2) : t2.prototype.replaceChild.call(this, e2, r3);
            }, r2.prototype.core = function() {
              return this;
            }, r2.prototype.coreMO = function() {
              return this;
            }, r2.prototype.coreIndex = function() {
              return 0;
            }, r2.prototype.childPosition = function() {
              for (var t3, e2, r3 = this, n2 = r3.parent; n2 && n2.notParent; ) r3 = n2, n2 = n2.parent;
              if (n2) {
                var o2 = 0;
                try {
                  for (var i2 = a(n2.childNodes), s2 = i2.next(); !s2.done; s2 = i2.next()) {
                    if (s2.value === r3) return o2;
                    o2++;
                  }
                } catch (e3) {
                  t3 = { error: e3 };
                } finally {
                  try {
                    s2 && !s2.done && (e2 = i2.return) && e2.call(i2);
                  } finally {
                    if (t3) throw t3.error;
                  }
                }
              }
              return null;
            }, r2.prototype.setTeXclass = function(t3) {
              return this.getPrevClass(t3), null != this.texClass ? this : t3;
            }, r2.prototype.updateTeXclass = function(t3) {
              t3 && (this.prevClass = t3.prevClass, this.prevLevel = t3.prevLevel, t3.prevClass = t3.prevLevel = null, this.texClass = t3.texClass);
            }, r2.prototype.getPrevClass = function(t3) {
              t3 && (this.prevClass = t3.texClass, this.prevLevel = t3.attributes.get("scriptlevel"));
            }, r2.prototype.texSpacing = function() {
              var t3 = null != this.prevClass ? this.prevClass : e.TEXCLASS.NONE, r3 = this.texClass || e.TEXCLASS.ORD;
              if (t3 === e.TEXCLASS.NONE || r3 === e.TEXCLASS.NONE) return "";
              t3 === e.TEXCLASS.VCENTER && (t3 = e.TEXCLASS.ORD), r3 === e.TEXCLASS.VCENTER && (r3 = e.TEXCLASS.ORD);
              var n2 = p[t3][r3];
              return (this.prevLevel > 0 || this.attributes.get("scriptlevel") > 0) && n2 >= 0 ? "" : u[Math.abs(n2)];
            }, r2.prototype.hasSpacingAttributes = function() {
              return this.isEmbellished && this.coreMO().hasSpacingAttributes();
            }, r2.prototype.setInheritedAttributes = function(t3, e2, n2, o2) {
              var i2, l2;
              void 0 === t3 && (t3 = {}), void 0 === e2 && (e2 = false), void 0 === n2 && (n2 = 0), void 0 === o2 && (o2 = false);
              var c2 = this.attributes.getAllDefaults();
              try {
                for (var u2 = a(Object.keys(t3)), p2 = u2.next(); !p2.done; p2 = u2.next()) {
                  var f2 = p2.value;
                  if (c2.hasOwnProperty(f2) || r2.alwaysInherit.hasOwnProperty(f2)) {
                    var h2 = s(t3[f2], 2), d2 = h2[0], y2 = h2[1];
                    ((r2.noInherit[d2] || {})[this.kind] || {})[f2] || this.attributes.setInherited(f2, y2);
                  }
                }
              } catch (t4) {
                i2 = { error: t4 };
              } finally {
                try {
                  p2 && !p2.done && (l2 = u2.return) && l2.call(u2);
                } finally {
                  if (i2) throw i2.error;
                }
              }
              void 0 === this.attributes.getExplicit("displaystyle") && this.attributes.setInherited("displaystyle", e2), void 0 === this.attributes.getExplicit("scriptlevel") && this.attributes.setInherited("scriptlevel", n2), o2 && this.setProperty("texprimestyle", o2);
              var O2 = this.arity;
              if (O2 >= 0 && O2 !== 1 / 0 && (1 === O2 && 0 === this.childNodes.length || 1 !== O2 && this.childNodes.length !== O2)) if (O2 < this.childNodes.length) this.childNodes = this.childNodes.slice(0, O2);
              else for (; this.childNodes.length < O2; ) this.appendChild(this.factory.create("mrow"));
              this.setChildInheritedAttributes(t3, e2, n2, o2);
            }, r2.prototype.setChildInheritedAttributes = function(t3, e2, r3, n2) {
              var o2, i2;
              try {
                for (var s2 = a(this.childNodes), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                  l2.value.setInheritedAttributes(t3, e2, r3, n2);
                }
              } catch (t4) {
                o2 = { error: t4 };
              } finally {
                try {
                  l2 && !l2.done && (i2 = s2.return) && i2.call(s2);
                } finally {
                  if (o2) throw o2.error;
                }
              }
            }, r2.prototype.addInheritedAttributes = function(t3, e2) {
              var r3, n2, o2 = i({}, t3);
              try {
                for (var s2 = a(Object.keys(e2)), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                  var c2 = l2.value;
                  "displaystyle" !== c2 && "scriptlevel" !== c2 && "style" !== c2 && (o2[c2] = [this.kind, e2[c2]]);
                }
              } catch (t4) {
                r3 = { error: t4 };
              } finally {
                try {
                  l2 && !l2.done && (n2 = s2.return) && n2.call(s2);
                } finally {
                  if (r3) throw r3.error;
                }
              }
              return o2;
            }, r2.prototype.inheritAttributesFrom = function(t3) {
              var e2 = t3.attributes, r3 = e2.get("displaystyle"), n2 = e2.get("scriptlevel"), o2 = e2.isSet("mathsize") ? { mathsize: ["math", e2.get("mathsize")] } : {}, i2 = t3.getProperty("texprimestyle") || false;
              this.setInheritedAttributes(o2, r3, n2, i2);
            }, r2.prototype.verifyTree = function(t3) {
              if (void 0 === t3 && (t3 = null), null !== t3) {
                this.verifyAttributes(t3);
                var e2 = this.arity;
                t3.checkArity && e2 >= 0 && e2 !== 1 / 0 && (1 === e2 && 0 === this.childNodes.length || 1 !== e2 && this.childNodes.length !== e2) && this.mError('Wrong number of children for "' + this.kind + '" node', t3, true), this.verifyChildren(t3);
              }
            }, r2.prototype.verifyAttributes = function(t3) {
              var e2, r3;
              if (t3.checkAttributes) {
                var n2 = this.attributes, o2 = [];
                try {
                  for (var i2 = a(n2.getExplicitNames()), s2 = i2.next(); !s2.done; s2 = i2.next()) {
                    var l2 = s2.value;
                    "data-" === l2.substr(0, 5) || void 0 !== n2.getDefault(l2) || l2.match(/^(?:class|style|id|(?:xlink:)?href)$/) || o2.push(l2);
                  }
                } catch (t4) {
                  e2 = { error: t4 };
                } finally {
                  try {
                    s2 && !s2.done && (r3 = i2.return) && r3.call(i2);
                  } finally {
                    if (e2) throw e2.error;
                  }
                }
                o2.length && this.mError("Unknown attributes for " + this.kind + " node: " + o2.join(", "), t3);
              }
            }, r2.prototype.verifyChildren = function(t3) {
              var e2, r3;
              try {
                for (var n2 = a(this.childNodes), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  o2.value.verifyTree(t3);
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r3 = n2.return) && r3.call(n2);
                } finally {
                  if (e2) throw e2.error;
                }
              }
            }, r2.prototype.mError = function(t3, e2, r3) {
              if (void 0 === r3 && (r3 = false), this.parent && this.parent.isKind("merror")) return null;
              var n2 = this.factory.create("merror");
              if (n2.attributes.set("data-mjx-message", t3), e2.fullErrors || r3) {
                var o2 = this.factory.create("mtext"), i2 = this.factory.create("text");
                i2.setText(e2.fullErrors ? t3 : this.kind), o2.appendChild(i2), n2.appendChild(o2), this.parent.replaceChild(n2, this);
              } else this.parent.replaceChild(n2, this), n2.appendChild(this);
              return n2;
            }, r2.defaults = { mathbackground: l.INHERIT, mathcolor: l.INHERIT, mathsize: l.INHERIT, dir: l.INHERIT }, r2.noInherit = { mstyle: { mpadded: { width: true, height: true, depth: true, lspace: true, voffset: true }, mtable: { width: true, height: true, depth: true, align: true } }, maligngroup: { mrow: { groupalign: true }, mtable: { groupalign: true } } }, r2.alwaysInherit = { scriptminsize: true, scriptsizemultiplier: true }, r2.verifyDefaults = { checkArity: true, checkAttributes: false, fullErrors: false, fixMmultiscripts: true, fixMtables: true }, r2;
          })(c.AbstractNode);
          e.AbstractMmlNode = f;
          var h = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "isToken", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.getText = function() {
              var t3, e3, r2 = "";
              try {
                for (var n2 = a(this.childNodes), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  var i2 = o2.value;
                  i2 instanceof m && (r2 += i2.getText());
                }
              } catch (e4) {
                t3 = { error: e4 };
              } finally {
                try {
                  o2 && !o2.done && (e3 = n2.return) && e3.call(n2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return r2;
            }, e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              var o2, i2;
              try {
                for (var s2 = a(this.childNodes), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                  var c2 = l2.value;
                  c2 instanceof f && c2.setInheritedAttributes(t3, e3, r2, n2);
                }
              } catch (t4) {
                o2 = { error: t4 };
              } finally {
                try {
                  l2 && !l2.done && (i2 = s2.return) && i2.call(s2);
                } finally {
                  if (o2) throw o2.error;
                }
              }
            }, e2.prototype.walkTree = function(t3, e3) {
              var r2, n2;
              t3(this, e3);
              try {
                for (var o2 = a(this.childNodes), i2 = o2.next(); !i2.done; i2 = o2.next()) {
                  var s2 = i2.value;
                  s2 instanceof f && s2.walkTree(t3, e3);
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  i2 && !i2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return e3;
            }, e2.defaults = i(i({}, f.defaults), { mathvariant: "normal", mathsize: l.INHERIT }), e2;
          })(f);
          e.AbstractMmlTokenNode = h;
          var d = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "isSpacelike", { get: function() {
              return this.childNodes[0].isSpacelike;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isEmbellished", { get: function() {
              return this.childNodes[0].isEmbellished;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return -1;
            }, enumerable: false, configurable: true }), e2.prototype.core = function() {
              return this.childNodes[0];
            }, e2.prototype.coreMO = function() {
              return this.childNodes[0].coreMO();
            }, e2.prototype.setTeXclass = function(t3) {
              return t3 = this.childNodes[0].setTeXclass(t3), this.updateTeXclass(this.childNodes[0]), t3;
            }, e2.defaults = f.defaults, e2;
          })(f);
          e.AbstractMmlLayoutNode = d;
          var y = (function(t2) {
            function r2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(r2, t2), Object.defineProperty(r2.prototype, "isEmbellished", { get: function() {
              return this.childNodes[0].isEmbellished;
            }, enumerable: false, configurable: true }), r2.prototype.core = function() {
              return this.childNodes[0];
            }, r2.prototype.coreMO = function() {
              return this.childNodes[0].coreMO();
            }, r2.prototype.setTeXclass = function(t3) {
              var r3, n2;
              this.getPrevClass(t3), this.texClass = e.TEXCLASS.ORD;
              var o2 = this.childNodes[0];
              o2 ? this.isEmbellished || o2.isKind("mi") ? (t3 = o2.setTeXclass(t3), this.updateTeXclass(this.core())) : (o2.setTeXclass(null), t3 = this) : t3 = this;
              try {
                for (var i2 = a(this.childNodes.slice(1)), s2 = i2.next(); !s2.done; s2 = i2.next()) {
                  var l2 = s2.value;
                  l2 && l2.setTeXclass(null);
                }
              } catch (t4) {
                r3 = { error: t4 };
              } finally {
                try {
                  s2 && !s2.done && (n2 = i2.return) && n2.call(i2);
                } finally {
                  if (r3) throw r3.error;
                }
              }
              return t3;
            }, r2.defaults = f.defaults, r2;
          })(f);
          e.AbstractMmlBaseNode = y;
          var O = (function(t2) {
            function r2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(r2, t2), Object.defineProperty(r2.prototype, "isToken", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "isEmbellished", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "isSpacelike", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "linebreakContainer", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "hasNewLine", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "arity", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "isInferred", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "notParent", { get: function() {
              return false;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "Parent", { get: function() {
              return this.parent;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "texClass", { get: function() {
              return e.TEXCLASS.NONE;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "prevClass", { get: function() {
              return e.TEXCLASS.NONE;
            }, enumerable: false, configurable: true }), Object.defineProperty(r2.prototype, "prevLevel", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), r2.prototype.hasSpacingAttributes = function() {
              return false;
            }, Object.defineProperty(r2.prototype, "attributes", { get: function() {
              return null;
            }, enumerable: false, configurable: true }), r2.prototype.core = function() {
              return this;
            }, r2.prototype.coreMO = function() {
              return this;
            }, r2.prototype.coreIndex = function() {
              return 0;
            }, r2.prototype.childPosition = function() {
              return 0;
            }, r2.prototype.setTeXclass = function(t3) {
              return t3;
            }, r2.prototype.texSpacing = function() {
              return "";
            }, r2.prototype.setInheritedAttributes = function(t3, e2, r3, n2) {
            }, r2.prototype.inheritAttributesFrom = function(t3) {
            }, r2.prototype.verifyTree = function(t3) {
            }, r2.prototype.mError = function(t3, e2, r3) {
              return void 0 === r3 && (r3 = false), null;
            }, r2;
          })(c.AbstractEmptyNode);
          e.AbstractMmlEmptyNode = O;
          var m = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.text = "", e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "text";
            }, enumerable: false, configurable: true }), e2.prototype.getText = function() {
              return this.text;
            }, e2.prototype.setText = function(t3) {
              return this.text = t3, this;
            }, e2.prototype.copy = function() {
              return this.factory.create(this.kind).setText(this.getText());
            }, e2.prototype.toString = function() {
              return this.text;
            }, e2;
          })(O);
          e.TextNode = m;
          var v = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.xml = null, e3.adaptor = null, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "XML";
            }, enumerable: false, configurable: true }), e2.prototype.getXML = function() {
              return this.xml;
            }, e2.prototype.setXML = function(t3, e3) {
              return void 0 === e3 && (e3 = null), this.xml = t3, this.adaptor = e3, this;
            }, e2.prototype.getSerializedXML = function() {
              return this.adaptor.serializeXML(this.xml);
            }, e2.prototype.copy = function() {
              return this.factory.create(this.kind).setXML(this.adaptor.clone(this.xml));
            }, e2.prototype.toString = function() {
              return "XML data";
            }, e2;
          })(O);
          e.XMLNode = v;
        }, 3948: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.TeXAtom = void 0;
          var a = r(9007), s = r(2756), l = (function(t2) {
            function e2(e3, r2, n2) {
              var o2 = t2.call(this, e3, r2, n2) || this;
              return o2.texclass = a.TEXCLASS.ORD, o2.setProperty("texClass", o2.texClass), o2;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "TeXAtom";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return -1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "notParent", { get: function() {
              return this.childNodes[0] && 1 === this.childNodes[0].childNodes.length;
            }, enumerable: false, configurable: true }), e2.prototype.setTeXclass = function(t3) {
              return this.childNodes[0].setTeXclass(null), this.adjustTeXclass(t3);
            }, e2.prototype.adjustTeXclass = function(t3) {
              return t3;
            }, e2.defaults = i({}, a.AbstractMmlBaseNode.defaults), e2;
          })(a.AbstractMmlBaseNode);
          e.TeXAtom = l, l.prototype.adjustTeXclass = s.MmlMo.prototype.adjustTeXclass;
        }, 9145: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMaction = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "maction";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "selected", { get: function() {
              var t3 = this.attributes.get("selection"), e3 = Math.max(1, Math.min(this.childNodes.length, t3)) - 1;
              return this.childNodes[e3] || this.factory.create("mrow");
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isEmbellished", { get: function() {
              return this.selected.isEmbellished;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isSpacelike", { get: function() {
              return this.selected.isSpacelike;
            }, enumerable: false, configurable: true }), e2.prototype.core = function() {
              return this.selected.core();
            }, e2.prototype.coreMO = function() {
              return this.selected.coreMO();
            }, e2.prototype.verifyAttributes = function(e3) {
              (t2.prototype.verifyAttributes.call(this, e3), "toggle" !== this.attributes.get("actiontype") && void 0 !== this.attributes.getExplicit("selection")) && delete this.attributes.getAllAttributes().selection;
            }, e2.prototype.setTeXclass = function(t3) {
              "tooltip" === this.attributes.get("actiontype") && this.childNodes[1] && this.childNodes[1].setTeXclass(null);
              var e3 = this.selected;
              return t3 = e3.setTeXclass(t3), this.updateTeXclass(e3), t3;
            }, e2.prototype.nextToggleSelection = function() {
              var t3 = Math.max(1, this.attributes.get("selection") + 1);
              t3 > this.childNodes.length && (t3 = 1), this.attributes.set("selection", t3);
            }, e2.defaults = i(i({}, a.AbstractMmlNode.defaults), { actiontype: "toggle", selection: 1 }), e2;
          })(a.AbstractMmlNode);
          e.MmlMaction = s;
        }, 142: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMaligngroup = void 0;
          var a = r(9007), s = r(91), l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "maligngroup";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isSpacelike", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function(e3, r2, n2, o2) {
              e3 = this.addInheritedAttributes(e3, this.attributes.getAllAttributes()), t2.prototype.setChildInheritedAttributes.call(this, e3, r2, n2, o2);
            }, e2.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), { groupalign: s.INHERIT }), e2;
          })(a.AbstractMmlLayoutNode);
          e.MmlMaligngroup = l;
        }, 7590: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMalignmark = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "malignmark";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isSpacelike", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.defaults = i(i({}, a.AbstractMmlNode.defaults), { edge: "left" }), e2;
          })(a.AbstractMmlNode);
          e.MmlMalignmark = s;
        }, 3233: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMath = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "math";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function(e3, r2, n2, o2) {
              "display" === this.attributes.get("mode") && this.attributes.setInherited("display", "block"), e3 = this.addInheritedAttributes(e3, this.attributes.getAllAttributes()), r2 = !!this.attributes.get("displaystyle") || !this.attributes.get("displaystyle") && "block" === this.attributes.get("display"), this.attributes.setInherited("displaystyle", r2), n2 = this.attributes.get("scriptlevel") || this.constructor.defaults.scriptlevel, t2.prototype.setChildInheritedAttributes.call(this, e3, r2, n2, o2);
            }, e2.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), { mathvariant: "normal", mathsize: "normal", mathcolor: "", mathbackground: "transparent", dir: "ltr", scriptlevel: 0, displaystyle: false, display: "inline", maxwidth: "", overflow: "linebreak", altimg: "", "altimg-width": "", "altimg-height": "", "altimg-valign": "", alttext: "", cdgroup: "", scriptsizemultiplier: 1 / Math.sqrt(2), scriptminsize: "8px", infixlinebreakstyle: "before", lineleading: "1ex", linebreakmultchar: "\u2062", indentshift: "auto", indentalign: "auto", indenttarget: "", indentalignfirst: "indentalign", indentshiftfirst: "indentshift", indentalignlast: "indentalign", indentshiftlast: "indentshift" }), e2;
          })(a.AbstractMmlLayoutNode);
          e.MmlMath = s;
        }, 1334: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MathChoice = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "MathChoice";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 4;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "notParent", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setInheritedAttributes = function(t3, e3, r2, n2) {
              var o2 = e3 ? 0 : Math.max(0, Math.min(r2, 2)) + 1, i2 = this.childNodes[o2] || this.factory.create("mrow");
              this.parent.replaceChild(i2, this), i2.setInheritedAttributes(t3, e3, r2, n2);
            }, e2.defaults = i({}, a.AbstractMmlBaseNode.defaults), e2;
          })(a.AbstractMmlBaseNode);
          e.MathChoice = s;
        }, 6661: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMenclose = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "menclose";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return -1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContininer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setTeXclass = function(t3) {
              return t3 = this.childNodes[0].setTeXclass(t3), this.updateTeXclass(this.childNodes[0]), t3;
            }, e2.defaults = i(i({}, a.AbstractMmlNode.defaults), { notation: "longdiv" }), e2;
          })(a.AbstractMmlNode);
          e.MmlMenclose = s;
        }, 1581: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMerror = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "merror";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return -1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.defaults = i({}, a.AbstractMmlNode.defaults), e2;
          })(a.AbstractMmlNode);
          e.MmlMerror = s;
        }, 5410: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMfenced = void 0;
          var s = r(9007), l = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = s.TEXCLASS.INNER, e3.separators = [], e3.open = null, e3.close = null, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mfenced";
            }, enumerable: false, configurable: true }), e2.prototype.setTeXclass = function(t3) {
              this.getPrevClass(t3), this.open && (t3 = this.open.setTeXclass(t3)), this.childNodes[0] && (t3 = this.childNodes[0].setTeXclass(t3));
              for (var e3 = 1, r2 = this.childNodes.length; e3 < r2; e3++) this.separators[e3 - 1] && (t3 = this.separators[e3 - 1].setTeXclass(t3)), this.childNodes[e3] && (t3 = this.childNodes[e3].setTeXclass(t3));
              return this.close && (t3 = this.close.setTeXclass(t3)), this.updateTeXclass(this.open), t3;
            }, e2.prototype.setChildInheritedAttributes = function(e3, r2, n2, o2) {
              var i2, s2;
              this.addFakeNodes();
              try {
                for (var l2 = a([this.open, this.close].concat(this.separators)), c = l2.next(); !c.done; c = l2.next()) {
                  var u = c.value;
                  u && u.setInheritedAttributes(e3, r2, n2, o2);
                }
              } catch (t3) {
                i2 = { error: t3 };
              } finally {
                try {
                  c && !c.done && (s2 = l2.return) && s2.call(l2);
                } finally {
                  if (i2) throw i2.error;
                }
              }
              t2.prototype.setChildInheritedAttributes.call(this, e3, r2, n2, o2);
            }, e2.prototype.addFakeNodes = function() {
              var t3, e3, r2 = this.attributes.getList("open", "close", "separators"), n2 = r2.open, o2 = r2.close, i2 = r2.separators;
              if (n2 = n2.replace(/[ \t\n\r]/g, ""), o2 = o2.replace(/[ \t\n\r]/g, ""), i2 = i2.replace(/[ \t\n\r]/g, ""), n2 && (this.open = this.fakeNode(n2, { fence: true, form: "prefix" }, s.TEXCLASS.OPEN)), i2) {
                for (; i2.length < this.childNodes.length - 1; ) i2 += i2.charAt(i2.length - 1);
                var l2 = 0;
                try {
                  for (var c = a(this.childNodes.slice(1)), u = c.next(); !u.done; u = c.next()) {
                    u.value && this.separators.push(this.fakeNode(i2.charAt(l2++)));
                  }
                } catch (e4) {
                  t3 = { error: e4 };
                } finally {
                  try {
                    u && !u.done && (e3 = c.return) && e3.call(c);
                  } finally {
                    if (t3) throw t3.error;
                  }
                }
              }
              o2 && (this.close = this.fakeNode(o2, { fence: true, form: "postfix" }, s.TEXCLASS.CLOSE));
            }, e2.prototype.fakeNode = function(t3, e3, r2) {
              void 0 === e3 && (e3 = {}), void 0 === r2 && (r2 = null);
              var n2 = this.factory.create("text").setText(t3), o2 = this.factory.create("mo", e3, [n2]);
              return o2.texClass = r2, o2.parent = this, o2;
            }, e2.defaults = i(i({}, s.AbstractMmlNode.defaults), { open: "(", close: ")", separators: "," }), e2;
          })(s.AbstractMmlNode);
          e.MmlMfenced = l;
        }, 6850: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMfrac = void 0;
          var s = r(9007), l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mfrac";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setTeXclass = function(t3) {
              var e3, r2;
              this.getPrevClass(t3);
              try {
                for (var n2 = a(this.childNodes), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  o2.value.setTeXclass(null);
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r2 = n2.return) && r2.call(n2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              return this;
            }, e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              (!e3 || r2 > 0) && r2++, this.childNodes[0].setInheritedAttributes(t3, false, r2, n2), this.childNodes[1].setInheritedAttributes(t3, false, r2, true);
            }, e2.defaults = i(i({}, s.AbstractMmlBaseNode.defaults), { linethickness: "medium", numalign: "center", denomalign: "center", bevelled: false }), e2;
          })(s.AbstractMmlBaseNode);
          e.MmlMfrac = l;
        }, 3985: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMglyph = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mglyph";
            }, enumerable: false, configurable: true }), e2.prototype.verifyAttributes = function(e3) {
              var r2 = this.attributes.getList("src", "fontfamily", "index"), n2 = r2.src, o2 = r2.fontfamily, i2 = r2.index;
              "" !== n2 || "" !== o2 && "" !== i2 ? t2.prototype.verifyAttributes.call(this, e3) : this.mError("mglyph must have either src or fontfamily and index attributes", e3, true);
            }, e2.defaults = i(i({}, a.AbstractMmlTokenNode.defaults), { alt: "", src: "", index: "", width: "auto", height: "auto", valign: "0em" }), e2;
          })(a.AbstractMmlTokenNode);
          e.MmlMglyph = s;
        }, 450: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMi = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mi";
            }, enumerable: false, configurable: true }), e2.prototype.setInheritedAttributes = function(r2, n2, o2, i2) {
              void 0 === r2 && (r2 = {}), void 0 === n2 && (n2 = false), void 0 === o2 && (o2 = 0), void 0 === i2 && (i2 = false), t2.prototype.setInheritedAttributes.call(this, r2, n2, o2, i2), this.getText().match(e2.singleCharacter) && !r2.mathvariant && this.attributes.setInherited("mathvariant", "italic");
            }, e2.prototype.setTeXclass = function(t3) {
              this.getPrevClass(t3);
              var r2 = this.getText();
              return r2.length > 1 && r2.match(e2.operatorName) && "normal" === this.attributes.get("mathvariant") && void 0 === this.getProperty("autoOP") && void 0 === this.getProperty("texClass") && (this.texClass = a.TEXCLASS.OP, this.setProperty("autoOP", true)), this;
            }, e2.defaults = i({}, a.AbstractMmlTokenNode.defaults), e2.operatorName = /^[a-z][a-z0-9]*$/i, e2.singleCharacter = /^[\uD800-\uDBFF]?.[\u0300-\u036F\u1AB0-\u1ABE\u1DC0-\u1DFF\u20D0-\u20EF]*$/, e2;
          })(a.AbstractMmlTokenNode);
          e.MmlMi = s;
        }, 6405: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlNone = e.MmlMprescripts = e.MmlMmultiscripts = void 0;
          var a = r(9007), s = r(4461), l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mmultiscripts";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              this.childNodes[0].setInheritedAttributes(t3, e3, r2, n2);
              for (var o2 = false, i2 = 1, a2 = 0; i2 < this.childNodes.length; i2++) {
                var s2 = this.childNodes[i2];
                if (s2.isKind("mprescripts")) {
                  if (!o2 && (o2 = true, i2 % 2 == 0)) {
                    var l2 = this.factory.create("mrow");
                    this.childNodes.splice(i2, 0, l2), l2.parent = this, i2++;
                  }
                } else {
                  var c2 = n2 || a2 % 2 == 0;
                  s2.setInheritedAttributes(t3, false, r2 + 1, c2), a2++;
                }
              }
              this.childNodes.length % 2 == (o2 ? 1 : 0) && (this.appendChild(this.factory.create("mrow")), this.childNodes[this.childNodes.length - 1].setInheritedAttributes(t3, false, r2 + 1, n2));
            }, e2.prototype.verifyChildren = function(e3) {
              for (var r2 = false, n2 = e3.fixMmultiscripts, o2 = 0; o2 < this.childNodes.length; o2++) {
                var i2 = this.childNodes[o2];
                i2.isKind("mprescripts") && (r2 ? i2.mError(i2.kind + " can only appear once in " + this.kind, e3, true) : (r2 = true, o2 % 2 != 0 || n2 || this.mError("There must be an equal number of prescripts of each type", e3)));
              }
              this.childNodes.length % 2 != (r2 ? 1 : 0) || n2 || this.mError("There must be an equal number of scripts of each type", e3), t2.prototype.verifyChildren.call(this, e3);
            }, e2.defaults = i({}, s.MmlMsubsup.defaults), e2;
          })(s.MmlMsubsup);
          e.MmlMmultiscripts = l;
          var c = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mprescripts";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), e2.prototype.verifyTree = function(e3) {
              t2.prototype.verifyTree.call(this, e3), this.parent && !this.parent.isKind("mmultiscripts") && this.mError(this.kind + " must be a child of mmultiscripts", e3, true);
            }, e2.defaults = i({}, a.AbstractMmlNode.defaults), e2;
          })(a.AbstractMmlNode);
          e.MmlMprescripts = c;
          var u = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "none";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), e2.prototype.verifyTree = function(e3) {
              t2.prototype.verifyTree.call(this, e3), this.parent && !this.parent.isKind("mmultiscripts") && this.mError(this.kind + " must be a child of mmultiscripts", e3, true);
            }, e2.defaults = i({}, a.AbstractMmlNode.defaults), e2;
          })(a.AbstractMmlNode);
          e.MmlNone = u;
        }, 3050: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMn = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mn";
            }, enumerable: false, configurable: true }), e2.defaults = i({}, a.AbstractMmlTokenNode.defaults), e2;
          })(a.AbstractMmlTokenNode);
          e.MmlMn = s;
        }, 2756: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, s = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMo = void 0;
          var l = r(9007), c = r(4082), u = r(505), p = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3._texClass = null, e3.lspace = 5 / 18, e3.rspace = 5 / 18, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "texClass", { get: function() {
              if (null === this._texClass) {
                var t3 = this.getText(), e3 = a(this.handleExplicitForm(this.getForms()), 3), r2 = e3[0], n2 = e3[1], o2 = e3[2], i2 = this.constructor.OPTABLE, s2 = i2[r2][t3] || i2[n2][t3] || i2[o2][t3];
                return s2 ? s2[2] : l.TEXCLASS.REL;
              }
              return this._texClass;
            }, set: function(t3) {
              this._texClass = t3;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mo";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isEmbellished", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "hasNewLine", { get: function() {
              return "newline" === this.attributes.get("linebreak");
            }, enumerable: false, configurable: true }), e2.prototype.coreParent = function() {
              for (var t3 = this, e3 = this, r2 = this.factory.getNodeClass("math"); e3 && e3.isEmbellished && e3.coreMO() === this && !(e3 instanceof r2); ) t3 = e3, e3 = e3.parent;
              return t3;
            }, e2.prototype.coreText = function(t3) {
              if (!t3) return "";
              if (t3.isEmbellished) return t3.coreMO().getText();
              for (; ((t3.isKind("mrow") || t3.isKind("TeXAtom") && t3.texClass !== l.TEXCLASS.VCENTER || t3.isKind("mstyle") || t3.isKind("mphantom")) && 1 === t3.childNodes.length || t3.isKind("munderover")) && t3.childNodes[0]; ) t3 = t3.childNodes[0];
              return t3.isToken ? t3.getText() : "";
            }, e2.prototype.hasSpacingAttributes = function() {
              return this.attributes.isSet("lspace") || this.attributes.isSet("rspace");
            }, Object.defineProperty(e2.prototype, "isAccent", { get: function() {
              var t3 = false, e3 = this.coreParent().parent;
              if (e3) {
                var r2 = e3.isKind("mover") ? e3.childNodes[e3.over].coreMO() ? "accent" : "" : e3.isKind("munder") ? e3.childNodes[e3.under].coreMO() ? "accentunder" : "" : e3.isKind("munderover") ? this === e3.childNodes[e3.over].coreMO() ? "accent" : this === e3.childNodes[e3.under].coreMO() ? "accentunder" : "" : "";
                if (r2) t3 = void 0 !== e3.attributes.getExplicit(r2) ? t3 : this.attributes.get("accent");
              }
              return t3;
            }, enumerable: false, configurable: true }), e2.prototype.setTeXclass = function(t3) {
              var e3 = this.attributes.getList("form", "fence"), r2 = e3.form, n2 = e3.fence;
              return void 0 === this.getProperty("texClass") && (this.attributes.isSet("lspace") || this.attributes.isSet("rspace")) ? null : (n2 && this.texClass === l.TEXCLASS.REL && ("prefix" === r2 && (this.texClass = l.TEXCLASS.OPEN), "postfix" === r2 && (this.texClass = l.TEXCLASS.CLOSE)), this.adjustTeXclass(t3));
            }, e2.prototype.adjustTeXclass = function(t3) {
              var e3 = this.texClass, r2 = this.prevClass;
              if (e3 === l.TEXCLASS.NONE) return t3;
              if (t3 ? (!t3.getProperty("autoOP") || e3 !== l.TEXCLASS.BIN && e3 !== l.TEXCLASS.REL || (r2 = t3.texClass = l.TEXCLASS.ORD), r2 = this.prevClass = t3.texClass || l.TEXCLASS.ORD, this.prevLevel = this.attributes.getInherited("scriptlevel")) : r2 = this.prevClass = l.TEXCLASS.NONE, e3 !== l.TEXCLASS.BIN || r2 !== l.TEXCLASS.NONE && r2 !== l.TEXCLASS.BIN && r2 !== l.TEXCLASS.OP && r2 !== l.TEXCLASS.REL && r2 !== l.TEXCLASS.OPEN && r2 !== l.TEXCLASS.PUNCT) if (r2 !== l.TEXCLASS.BIN || e3 !== l.TEXCLASS.REL && e3 !== l.TEXCLASS.CLOSE && e3 !== l.TEXCLASS.PUNCT) {
                if (e3 === l.TEXCLASS.BIN) {
                  for (var n2 = this, o2 = this.parent; o2 && o2.parent && o2.isEmbellished && (1 === o2.childNodes.length || !o2.isKind("mrow") && o2.core() === n2); ) n2 = o2, o2 = o2.parent;
                  o2.childNodes[o2.childNodes.length - 1] === n2 && (this.texClass = l.TEXCLASS.ORD);
                }
              } else t3.texClass = this.prevClass = l.TEXCLASS.ORD;
              else this.texClass = l.TEXCLASS.ORD;
              return this;
            }, e2.prototype.setInheritedAttributes = function(e3, r2, n2, o2) {
              void 0 === e3 && (e3 = {}), void 0 === r2 && (r2 = false), void 0 === n2 && (n2 = 0), void 0 === o2 && (o2 = false), t2.prototype.setInheritedAttributes.call(this, e3, r2, n2, o2);
              var i2 = this.getText();
              this.checkOperatorTable(i2), this.checkPseudoScripts(i2), this.checkPrimes(i2), this.checkMathAccent(i2);
            }, e2.prototype.checkOperatorTable = function(t3) {
              var e3, r2, n2 = a(this.handleExplicitForm(this.getForms()), 3), o2 = n2[0], i2 = n2[1], l2 = n2[2];
              this.attributes.setInherited("form", o2);
              var u2 = this.constructor.OPTABLE, p2 = u2[o2][t3] || u2[i2][t3] || u2[l2][t3];
              if (p2) {
                void 0 === this.getProperty("texClass") && (this.texClass = p2[2]);
                try {
                  for (var f = s(Object.keys(p2[3] || {})), h = f.next(); !h.done; h = f.next()) {
                    var d = h.value;
                    this.attributes.setInherited(d, p2[3][d]);
                  }
                } catch (t4) {
                  e3 = { error: t4 };
                } finally {
                  try {
                    h && !h.done && (r2 = f.return) && r2.call(f);
                  } finally {
                    if (e3) throw e3.error;
                  }
                }
                this.lspace = (p2[0] + 1) / 18, this.rspace = (p2[1] + 1) / 18;
              } else {
                var y = (0, c.getRange)(t3);
                if (y) {
                  void 0 === this.getProperty("texClass") && (this.texClass = y[2]);
                  var O = this.constructor.MMLSPACING[y[2]];
                  this.lspace = (O[0] + 1) / 18, this.rspace = (O[1] + 1) / 18;
                }
              }
            }, e2.prototype.getForms = function() {
              for (var t3 = this, e3 = this.parent, r2 = this.Parent; r2 && r2.isEmbellished; ) t3 = e3, e3 = r2.parent, r2 = r2.Parent;
              if (e3 && e3.isKind("mrow") && 1 !== e3.nonSpaceLength()) {
                if (e3.firstNonSpace() === t3) return ["prefix", "infix", "postfix"];
                if (e3.lastNonSpace() === t3) return ["postfix", "infix", "prefix"];
              }
              return ["infix", "prefix", "postfix"];
            }, e2.prototype.handleExplicitForm = function(t3) {
              if (this.attributes.isSet("form")) {
                var e3 = this.attributes.get("form");
                t3 = [e3].concat(t3.filter((function(t4) {
                  return t4 !== e3;
                })));
              }
              return t3;
            }, e2.prototype.checkPseudoScripts = function(t3) {
              var e3 = this.constructor.pseudoScripts;
              if (t3.match(e3)) {
                var r2 = this.coreParent().Parent, n2 = !r2 || !(r2.isKind("msubsup") && !r2.isKind("msub"));
                this.setProperty("pseudoscript", n2), n2 && (this.attributes.setInherited("lspace", 0), this.attributes.setInherited("rspace", 0));
              }
            }, e2.prototype.checkPrimes = function(t3) {
              var e3 = this.constructor.primes;
              if (t3.match(e3)) {
                var r2 = this.constructor.remapPrimes, n2 = (0, u.unicodeString)((0, u.unicodeChars)(t3).map((function(t4) {
                  return r2[t4];
                })));
                this.setProperty("primes", n2);
              }
            }, e2.prototype.checkMathAccent = function(t3) {
              var e3 = this.Parent;
              if (void 0 === this.getProperty("mathaccent") && e3 && e3.isKind("munderover")) {
                var r2 = e3.childNodes[0];
                if (!r2.isEmbellished || r2.coreMO() !== this) {
                  var n2 = this.constructor.mathaccents;
                  t3.match(n2) && this.setProperty("mathaccent", true);
                }
              }
            }, e2.defaults = i(i({}, l.AbstractMmlTokenNode.defaults), { form: "infix", fence: false, separator: false, lspace: "thickmathspace", rspace: "thickmathspace", stretchy: false, symmetric: false, maxsize: "infinity", minsize: "0em", largeop: false, movablelimits: false, accent: false, linebreak: "auto", lineleading: "1ex", linebreakstyle: "before", indentalign: "auto", indentshift: "0", indenttarget: "", indentalignfirst: "indentalign", indentshiftfirst: "indentshift", indentalignlast: "indentalign", indentshiftlast: "indentshift" }), e2.MMLSPACING = c.MMLSPACING, e2.OPTABLE = c.OPTABLE, e2.pseudoScripts = new RegExp(["^[\"'*`", "\xAA", "\xB0", "\xB2-\xB4", "\xB9", "\xBA", "\u2018-\u201F", "\u2032-\u2037\u2057", "\u2070\u2071", "\u2074-\u207F", "\u2080-\u208E", "]+$"].join("")), e2.primes = new RegExp(["^[\"'`", "\u2018-\u201F", "]+$"].join("")), e2.remapPrimes = { 34: 8243, 39: 8242, 96: 8245, 8216: 8245, 8217: 8242, 8218: 8242, 8219: 8245, 8220: 8246, 8221: 8243, 8222: 8243, 8223: 8246 }, e2.mathaccents = new RegExp(["^[", "\xB4\u0301\u02CA", "`\u0300\u02CB", "\xA8\u0308", "~\u0303\u02DC", "\xAF\u0304\u02C9", "\u02D8\u0306", "\u02C7\u030C", "^\u0302\u02C6", "\u2192\u20D7", "\u02D9\u0307", "\u02DA\u030A", "\u20DB", "\u20DC", "]$"].join("")), e2;
          })(l.AbstractMmlTokenNode);
          e.MmlMo = p;
        }, 7238: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMpadded = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mpadded";
            }, enumerable: false, configurable: true }), e2.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), { width: "", height: "", depth: "", lspace: 0, voffset: 0 }), e2;
          })(a.AbstractMmlLayoutNode);
          e.MmlMpadded = s;
        }, 5741: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMphantom = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mphantom";
            }, enumerable: false, configurable: true }), e2.defaults = i({}, a.AbstractMmlLayoutNode.defaults), e2;
          })(a.AbstractMmlLayoutNode);
          e.MmlMphantom = s;
        }, 6145: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMroot = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mroot";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), e2.prototype.setTeXclass = function(t3) {
              return this.getPrevClass(t3), this.childNodes[0].setTeXclass(null), this.childNodes[1].setTeXclass(null), this;
            }, e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              this.childNodes[0].setInheritedAttributes(t3, e3, r2, true), this.childNodes[1].setInheritedAttributes(t3, false, r2 + 2, n2);
            }, e2.defaults = i({}, a.AbstractMmlNode.defaults), e2;
          })(a.AbstractMmlNode);
          e.MmlMroot = s;
        }, 9878: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlInferredMrow = e.MmlMrow = void 0;
          var s = r(9007), l = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3._core = null, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mrow";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isSpacelike", { get: function() {
              var t3, e3;
              try {
                for (var r2 = a(this.childNodes), n2 = r2.next(); !n2.done; n2 = r2.next()) {
                  if (!n2.value.isSpacelike) return false;
                }
              } catch (e4) {
                t3 = { error: e4 };
              } finally {
                try {
                  n2 && !n2.done && (e3 = r2.return) && e3.call(r2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return true;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isEmbellished", { get: function() {
              var t3, e3, r2 = false, n2 = 0;
              try {
                for (var o2 = a(this.childNodes), i2 = o2.next(); !i2.done; i2 = o2.next()) {
                  var s2 = i2.value;
                  if (s2) {
                    if (s2.isEmbellished) {
                      if (r2) return false;
                      r2 = true, this._core = n2;
                    } else if (!s2.isSpacelike) return false;
                  }
                  n2++;
                }
              } catch (e4) {
                t3 = { error: e4 };
              } finally {
                try {
                  i2 && !i2.done && (e3 = o2.return) && e3.call(o2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return r2;
            }, enumerable: false, configurable: true }), e2.prototype.core = function() {
              return this.isEmbellished && null != this._core ? this.childNodes[this._core] : this;
            }, e2.prototype.coreMO = function() {
              return this.isEmbellished && null != this._core ? this.childNodes[this._core].coreMO() : this;
            }, e2.prototype.nonSpaceLength = function() {
              var t3, e3, r2 = 0;
              try {
                for (var n2 = a(this.childNodes), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  var i2 = o2.value;
                  i2 && !i2.isSpacelike && r2++;
                }
              } catch (e4) {
                t3 = { error: e4 };
              } finally {
                try {
                  o2 && !o2.done && (e3 = n2.return) && e3.call(n2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return r2;
            }, e2.prototype.firstNonSpace = function() {
              var t3, e3;
              try {
                for (var r2 = a(this.childNodes), n2 = r2.next(); !n2.done; n2 = r2.next()) {
                  var o2 = n2.value;
                  if (o2 && !o2.isSpacelike) return o2;
                }
              } catch (e4) {
                t3 = { error: e4 };
              } finally {
                try {
                  n2 && !n2.done && (e3 = r2.return) && e3.call(r2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return null;
            }, e2.prototype.lastNonSpace = function() {
              for (var t3 = this.childNodes.length; --t3 >= 0; ) {
                var e3 = this.childNodes[t3];
                if (e3 && !e3.isSpacelike) return e3;
              }
              return null;
            }, e2.prototype.setTeXclass = function(t3) {
              var e3, r2, n2, o2;
              if (null != this.getProperty("open") || null != this.getProperty("close")) {
                this.getPrevClass(t3), t3 = null;
                try {
                  for (var i2 = a(this.childNodes), l2 = i2.next(); !l2.done; l2 = i2.next()) {
                    t3 = l2.value.setTeXclass(t3);
                  }
                } catch (t4) {
                  e3 = { error: t4 };
                } finally {
                  try {
                    l2 && !l2.done && (r2 = i2.return) && r2.call(i2);
                  } finally {
                    if (e3) throw e3.error;
                  }
                }
                null == this.texClass && (this.texClass = s.TEXCLASS.INNER);
              } else {
                try {
                  for (var c2 = a(this.childNodes), u = c2.next(); !u.done; u = c2.next()) {
                    t3 = u.value.setTeXclass(t3);
                  }
                } catch (t4) {
                  n2 = { error: t4 };
                } finally {
                  try {
                    u && !u.done && (o2 = c2.return) && o2.call(c2);
                  } finally {
                    if (n2) throw n2.error;
                  }
                }
                this.childNodes[0] && this.updateTeXclass(this.childNodes[0]);
              }
              return t3;
            }, e2.defaults = i({}, s.AbstractMmlNode.defaults), e2;
          })(s.AbstractMmlNode);
          e.MmlMrow = l;
          var c = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "inferredMrow";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isInferred", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "notParent", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.toString = function() {
              return "[" + this.childNodes.join(",") + "]";
            }, e2.defaults = l.defaults, e2;
          })(l);
          e.MmlInferredMrow = c;
        }, 7265: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMs = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "ms";
            }, enumerable: false, configurable: true }), e2.defaults = i(i({}, a.AbstractMmlTokenNode.defaults), { lquote: '"', rquote: '"' }), e2;
          })(a.AbstractMmlTokenNode);
          e.MmlMs = s;
        }, 6030: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMspace = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.NONE, e3;
            }
            return o(e2, t2), e2.prototype.setTeXclass = function(t3) {
              return t3;
            }, Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mspace";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isSpacelike", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "hasNewline", { get: function() {
              var t3 = this.attributes;
              return null == t3.getExplicit("width") && null == t3.getExplicit("height") && null == t3.getExplicit("depth") && "newline" === t3.get("linebreak");
            }, enumerable: false, configurable: true }), e2.defaults = i(i({}, a.AbstractMmlTokenNode.defaults), { width: "0em", height: "0ex", depth: "0ex", linebreak: "auto" }), e2;
          })(a.AbstractMmlTokenNode);
          e.MmlMspace = s;
        }, 7131: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMsqrt = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "msqrt";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return -1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setTeXclass = function(t3) {
              return this.getPrevClass(t3), this.childNodes[0].setTeXclass(null), this;
            }, e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              this.childNodes[0].setInheritedAttributes(t3, e3, r2, true);
            }, e2.defaults = i({}, a.AbstractMmlNode.defaults), e2;
          })(a.AbstractMmlNode);
          e.MmlMsqrt = s;
        }, 1314: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMstyle = void 0;
          var a = r(9007), s = r(91), l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mstyle";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "notParent", { get: function() {
              return this.childNodes[0] && 1 === this.childNodes[0].childNodes.length;
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              var o2 = this.attributes.getExplicit("scriptlevel");
              null != o2 && ((o2 = o2.toString()).match(/^\s*[-+]/) ? r2 += parseInt(o2) : r2 = parseInt(o2), n2 = false);
              var i2 = this.attributes.getExplicit("displaystyle");
              null != i2 && (e3 = true === i2, n2 = false);
              var a2 = this.attributes.getExplicit("data-cramped");
              null != a2 && (n2 = a2), t3 = this.addInheritedAttributes(t3, this.attributes.getAllAttributes()), this.childNodes[0].setInheritedAttributes(t3, e3, r2, n2);
            }, e2.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), { scriptlevel: s.INHERIT, displaystyle: s.INHERIT, scriptsizemultiplier: 1 / Math.sqrt(2), scriptminsize: "8px", mathbackground: s.INHERIT, mathcolor: s.INHERIT, dir: s.INHERIT, infixlinebreakstyle: "before" }), e2;
          })(a.AbstractMmlLayoutNode);
          e.MmlMstyle = l;
        }, 4461: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMsup = e.MmlMsub = e.MmlMsubsup = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "msubsup";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 3;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "base", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "sub", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "sup", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              var o2 = this.childNodes;
              o2[0].setInheritedAttributes(t3, e3, r2, n2), o2[1].setInheritedAttributes(t3, false, r2 + 1, n2 || 1 === this.sub), o2[2] && o2[2].setInheritedAttributes(t3, false, r2 + 1, n2 || 2 === this.sub);
            }, e2.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), { subscriptshift: "", superscriptshift: "" }), e2;
          })(a.AbstractMmlBaseNode);
          e.MmlMsubsup = s;
          var l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "msub";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), e2.defaults = i({}, s.defaults), e2;
          })(s);
          e.MmlMsub = l;
          var c = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "msup";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "sup", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "sub", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), e2.defaults = i({}, s.defaults), e2;
          })(s);
          e.MmlMsup = c;
        }, 1349: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMtable = void 0;
          var s = r(9007), l = r(505), c = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.properties = { useHeight: true }, e3.texclass = s.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mtable";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setInheritedAttributes = function(e3, r2, n2, o2) {
              var i2, l2;
              try {
                for (var c2 = a(s.indentAttributes), u = c2.next(); !u.done; u = c2.next()) {
                  var p = u.value;
                  e3[p] && this.attributes.setInherited(p, e3[p][1]), void 0 !== this.attributes.getExplicit(p) && delete this.attributes.getAllAttributes()[p];
                }
              } catch (t3) {
                i2 = { error: t3 };
              } finally {
                try {
                  u && !u.done && (l2 = c2.return) && l2.call(c2);
                } finally {
                  if (i2) throw i2.error;
                }
              }
              t2.prototype.setInheritedAttributes.call(this, e3, r2, n2, o2);
            }, e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              var o2, i2, s2, c2;
              try {
                for (var u = a(this.childNodes), p = u.next(); !p.done; p = u.next()) {
                  (O = p.value).isKind("mtr") || this.replaceChild(this.factory.create("mtr"), O).appendChild(O);
                }
              } catch (t4) {
                o2 = { error: t4 };
              } finally {
                try {
                  p && !p.done && (i2 = u.return) && i2.call(u);
                } finally {
                  if (o2) throw o2.error;
                }
              }
              r2 = this.getProperty("scriptlevel") || r2, e3 = !(!this.attributes.getExplicit("displaystyle") && !this.attributes.getDefault("displaystyle")), t3 = this.addInheritedAttributes(t3, { columnalign: this.attributes.get("columnalign"), rowalign: "center" });
              var f = this.attributes.getExplicit("data-cramped"), h = (0, l.split)(this.attributes.get("rowalign"));
              try {
                for (var d = a(this.childNodes), y = d.next(); !y.done; y = d.next()) {
                  var O = y.value;
                  t3.rowalign[1] = h.shift() || t3.rowalign[1], O.setInheritedAttributes(t3, e3, r2, !!f);
                }
              } catch (t4) {
                s2 = { error: t4 };
              } finally {
                try {
                  y && !y.done && (c2 = d.return) && c2.call(d);
                } finally {
                  if (s2) throw s2.error;
                }
              }
            }, e2.prototype.verifyChildren = function(e3) {
              for (var r2 = null, n2 = this.factory, o2 = 0; o2 < this.childNodes.length; o2++) {
                var i2 = this.childNodes[o2];
                if (i2.isKind("mtr")) r2 = null;
                else {
                  var a2 = i2.isKind("mtd");
                  if (r2 ? (this.removeChild(i2), o2--) : r2 = this.replaceChild(n2.create("mtr"), i2), r2.appendChild(a2 ? i2 : n2.create("mtd", {}, [i2])), !e3.fixMtables) {
                    i2.parent.removeChild(i2), i2.parent = this, a2 && r2.appendChild(n2.create("mtd"));
                    var s2 = i2.mError("Children of " + this.kind + " must be mtr or mlabeledtr", e3, a2);
                    r2.childNodes[r2.childNodes.length - 1].appendChild(s2);
                  }
                }
              }
              t2.prototype.verifyChildren.call(this, e3);
            }, e2.prototype.setTeXclass = function(t3) {
              var e3, r2;
              this.getPrevClass(t3);
              try {
                for (var n2 = a(this.childNodes), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  o2.value.setTeXclass(null);
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r2 = n2.return) && r2.call(n2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              return this;
            }, e2.defaults = i(i({}, s.AbstractMmlNode.defaults), { align: "axis", rowalign: "baseline", columnalign: "center", groupalign: "{left}", alignmentscope: true, columnwidth: "auto", width: "auto", rowspacing: "1ex", columnspacing: ".8em", rowlines: "none", columnlines: "none", frame: "none", framespacing: "0.4em 0.5ex", equalrows: false, equalcolumns: false, displaystyle: false, side: "right", minlabelspacing: "0.8em" }), e2;
          })(s.AbstractMmlNode);
          e.MmlMtable = c;
        }, 4359: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMtd = void 0;
          var a = r(9007), s = r(91), l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mtd";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return -1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.verifyChildren = function(e3) {
              !this.parent || this.parent.isKind("mtr") ? t2.prototype.verifyChildren.call(this, e3) : this.mError(this.kind + " can only be a child of an mtr or mlabeledtr", e3, true);
            }, e2.prototype.setTeXclass = function(t3) {
              return this.getPrevClass(t3), this.childNodes[0].setTeXclass(null), this;
            }, e2.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), { rowspan: 1, columnspan: 1, rowalign: s.INHERIT, columnalign: s.INHERIT, groupalign: s.INHERIT }), e2;
          })(a.AbstractMmlBaseNode);
          e.MmlMtd = l;
        }, 4770: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMtext = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.texclass = a.TEXCLASS.ORD, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mtext";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "isSpacelike", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.defaults = i({}, a.AbstractMmlTokenNode.defaults), e2;
          })(a.AbstractMmlTokenNode);
          e.MmlMtext = s;
        }, 5022: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMlabeledtr = e.MmlMtr = void 0;
          var s = r(9007), l = r(91), c = r(505), u = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mtr";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              var o2, i2, s2, l2;
              try {
                for (var u2 = a(this.childNodes), p2 = u2.next(); !p2.done; p2 = u2.next()) {
                  (y = p2.value).isKind("mtd") || this.replaceChild(this.factory.create("mtd"), y).appendChild(y);
                }
              } catch (t4) {
                o2 = { error: t4 };
              } finally {
                try {
                  p2 && !p2.done && (i2 = u2.return) && i2.call(u2);
                } finally {
                  if (o2) throw o2.error;
                }
              }
              var f = (0, c.split)(this.attributes.get("columnalign"));
              1 === this.arity && f.unshift(this.parent.attributes.get("side")), t3 = this.addInheritedAttributes(t3, { rowalign: this.attributes.get("rowalign"), columnalign: "center" });
              try {
                for (var h = a(this.childNodes), d = h.next(); !d.done; d = h.next()) {
                  var y = d.value;
                  t3.columnalign[1] = f.shift() || t3.columnalign[1], y.setInheritedAttributes(t3, e3, r2, n2);
                }
              } catch (t4) {
                s2 = { error: t4 };
              } finally {
                try {
                  d && !d.done && (l2 = h.return) && l2.call(h);
                } finally {
                  if (s2) throw s2.error;
                }
              }
            }, e2.prototype.verifyChildren = function(e3) {
              var r2, n2;
              if (!this.parent || this.parent.isKind("mtable")) {
                try {
                  for (var o2 = a(this.childNodes), i2 = o2.next(); !i2.done; i2 = o2.next()) {
                    var s2 = i2.value;
                    if (!s2.isKind("mtd")) this.replaceChild(this.factory.create("mtd"), s2).appendChild(s2), e3.fixMtables || s2.mError("Children of " + this.kind + " must be mtd", e3);
                  }
                } catch (t3) {
                  r2 = { error: t3 };
                } finally {
                  try {
                    i2 && !i2.done && (n2 = o2.return) && n2.call(o2);
                  } finally {
                    if (r2) throw r2.error;
                  }
                }
                t2.prototype.verifyChildren.call(this, e3);
              } else this.mError(this.kind + " can only be a child of an mtable", e3, true);
            }, e2.prototype.setTeXclass = function(t3) {
              var e3, r2;
              this.getPrevClass(t3);
              try {
                for (var n2 = a(this.childNodes), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  o2.value.setTeXclass(null);
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r2 = n2.return) && r2.call(n2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              return this;
            }, e2.defaults = i(i({}, s.AbstractMmlNode.defaults), { rowalign: l.INHERIT, columnalign: l.INHERIT, groupalign: l.INHERIT }), e2;
          })(s.AbstractMmlNode);
          e.MmlMtr = u;
          var p = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mlabeledtr";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), e2;
          })(u);
          e.MmlMlabeledtr = p;
        }, 5184: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlMover = e.MmlMunder = e.MmlMunderover = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "munderover";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 3;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "base", { get: function() {
              return 0;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "under", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "over", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "linebreakContainer", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function(t3, e3, r2, n2) {
              var o2 = this.childNodes;
              o2[0].setInheritedAttributes(t3, e3, r2, n2 || !!o2[this.over]);
              var i2 = !(e3 || !o2[0].coreMO().attributes.get("movablelimits")), a2 = this.constructor.ACCENTS;
              o2[1].setInheritedAttributes(t3, false, this.getScriptlevel(a2[1], i2, r2), n2 || 1 === this.under), this.setInheritedAccent(1, a2[1], e3, r2, n2, i2), o2[2] && (o2[2].setInheritedAttributes(t3, false, this.getScriptlevel(a2[2], i2, r2), n2 || 2 === this.under), this.setInheritedAccent(2, a2[2], e3, r2, n2, i2));
            }, e2.prototype.getScriptlevel = function(t3, e3, r2) {
              return !e3 && this.attributes.get(t3) || r2++, r2;
            }, e2.prototype.setInheritedAccent = function(t3, e3, r2, n2, o2, i2) {
              var a2 = this.childNodes[t3];
              if (null == this.attributes.getExplicit(e3) && a2.isEmbellished) {
                var s2 = a2.coreMO().attributes.get("accent");
                this.attributes.setInherited(e3, s2), s2 !== this.attributes.getDefault(e3) && a2.setInheritedAttributes({}, r2, this.getScriptlevel(e3, i2, n2), o2);
              }
            }, e2.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), { accent: false, accentunder: false, align: "center" }), e2.ACCENTS = ["", "accentunder", "accent"], e2;
          })(a.AbstractMmlBaseNode);
          e.MmlMunderover = s;
          var l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "munder";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), e2.defaults = i({}, s.defaults), e2;
          })(s);
          e.MmlMunder = l;
          var c = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "mover";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "over", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "under", { get: function() {
              return 2;
            }, enumerable: false, configurable: true }), e2.defaults = i({}, s.defaults), e2.ACCENTS = ["", "accent", "accentunder"], e2;
          })(s);
          e.MmlMover = c;
        }, 9102: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlAnnotation = e.MmlAnnotationXML = e.MmlSemantics = void 0;
          var a = r(9007), s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "semantics";
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "arity", { get: function() {
              return 1;
            }, enumerable: false, configurable: true }), Object.defineProperty(e2.prototype, "notParent", { get: function() {
              return true;
            }, enumerable: false, configurable: true }), e2.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), { definitionUrl: null, encoding: null }), e2;
          })(a.AbstractMmlBaseNode);
          e.MmlSemantics = s;
          var l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "annotation-xml";
            }, enumerable: false, configurable: true }), e2.prototype.setChildInheritedAttributes = function() {
            }, e2.defaults = i(i({}, a.AbstractMmlNode.defaults), { definitionUrl: null, encoding: null, cd: "mathmlkeys", name: "", src: null }), e2;
          })(a.AbstractMmlNode);
          e.MmlAnnotationXML = l;
          var c = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.properties = { isChars: true }, e3;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "kind", { get: function() {
              return "annotation";
            }, enumerable: false, configurable: true }), e2.defaults = i({}, l.defaults), e2;
          })(l);
          e.MmlAnnotation = c;
        }, 6325: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.MmlVisitor = void 0;
          var i = r(3909), a = (function(t2) {
            function e2(e3) {
              return void 0 === e3 && (e3 = null), e3 || (e3 = new i.MmlFactory()), t2.call(this, e3) || this;
            }
            return o(e2, t2), e2.prototype.visitTextNode = function(t3) {
              for (var e3 = [], r2 = 1; r2 < arguments.length; r2++) e3[r2 - 1] = arguments[r2];
            }, e2.prototype.visitXMLNode = function(t3) {
              for (var e3 = [], r2 = 1; r2 < arguments.length; r2++) e3[r2 - 1] = arguments[r2];
            }, e2;
          })(r(8823).AbstractVisitor);
          e.MmlVisitor = a;
        }, 4082: function(t, e, r) {
          var n = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.OPTABLE = e.MMLSPACING = e.getRange = e.RANGES = e.MO = e.OPDEF = void 0;
          var o = r(9007);
          function i(t2, e2, r2, n2) {
            return void 0 === r2 && (r2 = o.TEXCLASS.BIN), void 0 === n2 && (n2 = null), [t2, e2, r2, n2];
          }
          e.OPDEF = i, e.MO = { ORD: i(0, 0, o.TEXCLASS.ORD), ORD11: i(1, 1, o.TEXCLASS.ORD), ORD21: i(2, 1, o.TEXCLASS.ORD), ORD02: i(0, 2, o.TEXCLASS.ORD), ORD55: i(5, 5, o.TEXCLASS.ORD), NONE: i(0, 0, o.TEXCLASS.NONE), OP: i(1, 2, o.TEXCLASS.OP, { largeop: true, movablelimits: true, symmetric: true }), OPFIXED: i(1, 2, o.TEXCLASS.OP, { largeop: true, movablelimits: true }), INTEGRAL: i(0, 1, o.TEXCLASS.OP, { largeop: true, symmetric: true }), INTEGRAL2: i(1, 2, o.TEXCLASS.OP, { largeop: true, symmetric: true }), BIN3: i(3, 3, o.TEXCLASS.BIN), BIN4: i(4, 4, o.TEXCLASS.BIN), BIN01: i(0, 1, o.TEXCLASS.BIN), BIN5: i(5, 5, o.TEXCLASS.BIN), TALLBIN: i(4, 4, o.TEXCLASS.BIN, { stretchy: true }), BINOP: i(4, 4, o.TEXCLASS.BIN, { largeop: true, movablelimits: true }), REL: i(5, 5, o.TEXCLASS.REL), REL1: i(1, 1, o.TEXCLASS.REL, { stretchy: true }), REL4: i(4, 4, o.TEXCLASS.REL), RELSTRETCH: i(5, 5, o.TEXCLASS.REL, { stretchy: true }), RELACCENT: i(5, 5, o.TEXCLASS.REL, { accent: true }), WIDEREL: i(5, 5, o.TEXCLASS.REL, { accent: true, stretchy: true }), OPEN: i(0, 0, o.TEXCLASS.OPEN, { fence: true, stretchy: true, symmetric: true }), CLOSE: i(0, 0, o.TEXCLASS.CLOSE, { fence: true, stretchy: true, symmetric: true }), INNER: i(0, 0, o.TEXCLASS.INNER), PUNCT: i(0, 3, o.TEXCLASS.PUNCT), ACCENT: i(0, 0, o.TEXCLASS.ORD, { accent: true }), WIDEACCENT: i(0, 0, o.TEXCLASS.ORD, { accent: true, stretchy: true }) }, e.RANGES = [[32, 127, o.TEXCLASS.REL, "mo"], [160, 191, o.TEXCLASS.ORD, "mo"], [192, 591, o.TEXCLASS.ORD, "mi"], [688, 879, o.TEXCLASS.ORD, "mo"], [880, 6688, o.TEXCLASS.ORD, "mi"], [6832, 6911, o.TEXCLASS.ORD, "mo"], [6912, 7615, o.TEXCLASS.ORD, "mi"], [7616, 7679, o.TEXCLASS.ORD, "mo"], [7680, 8191, o.TEXCLASS.ORD, "mi"], [8192, 8303, o.TEXCLASS.ORD, "mo"], [8304, 8351, o.TEXCLASS.ORD, "mo"], [8448, 8527, o.TEXCLASS.ORD, "mi"], [8528, 8591, o.TEXCLASS.ORD, "mn"], [8592, 8703, o.TEXCLASS.REL, "mo"], [8704, 8959, o.TEXCLASS.BIN, "mo"], [8960, 9215, o.TEXCLASS.ORD, "mo"], [9312, 9471, o.TEXCLASS.ORD, "mn"], [9472, 10223, o.TEXCLASS.ORD, "mo"], [10224, 10239, o.TEXCLASS.REL, "mo"], [10240, 10495, o.TEXCLASS.ORD, "mtext"], [10496, 10623, o.TEXCLASS.REL, "mo"], [10624, 10751, o.TEXCLASS.ORD, "mo"], [10752, 11007, o.TEXCLASS.BIN, "mo"], [11008, 11055, o.TEXCLASS.ORD, "mo"], [11056, 11087, o.TEXCLASS.REL, "mo"], [11088, 11263, o.TEXCLASS.ORD, "mo"], [11264, 11744, o.TEXCLASS.ORD, "mi"], [11776, 11903, o.TEXCLASS.ORD, "mo"], [11904, 12255, o.TEXCLASS.ORD, "mi", "normal"], [12272, 12351, o.TEXCLASS.ORD, "mo"], [12352, 42143, o.TEXCLASS.ORD, "mi", "normal"], [42192, 43055, o.TEXCLASS.ORD, "mi"], [43056, 43071, o.TEXCLASS.ORD, "mn"], [43072, 55295, o.TEXCLASS.ORD, "mi"], [63744, 64255, o.TEXCLASS.ORD, "mi", "normal"], [64256, 65023, o.TEXCLASS.ORD, "mi"], [65024, 65135, o.TEXCLASS.ORD, "mo"], [65136, 65791, o.TEXCLASS.ORD, "mi"], [65792, 65935, o.TEXCLASS.ORD, "mn"], [65936, 74751, o.TEXCLASS.ORD, "mi", "normal"], [74752, 74879, o.TEXCLASS.ORD, "mn"], [74880, 113823, o.TEXCLASS.ORD, "mi", "normal"], [113824, 119391, o.TEXCLASS.ORD, "mo"], [119648, 119679, o.TEXCLASS.ORD, "mn"], [119808, 120781, o.TEXCLASS.ORD, "mi"], [120782, 120831, o.TEXCLASS.ORD, "mn"], [122624, 129023, o.TEXCLASS.ORD, "mo"], [129024, 129279, o.TEXCLASS.REL, "mo"], [129280, 129535, o.TEXCLASS.ORD, "mo"], [131072, 195103, o.TEXCLASS.ORD, "mi", "normnal"]], e.getRange = function(t2) {
            var r2, o2, i2 = t2.codePointAt(0);
            try {
              for (var a = n(e.RANGES), s = a.next(); !s.done; s = a.next()) {
                var l = s.value;
                if (i2 <= l[1]) {
                  if (i2 >= l[0]) return l;
                  break;
                }
              }
            } catch (t3) {
              r2 = { error: t3 };
            } finally {
              try {
                s && !s.done && (o2 = a.return) && o2.call(a);
              } finally {
                if (r2) throw r2.error;
              }
            }
            return null;
          }, e.MMLSPACING = [[0, 0], [1, 2], [3, 3], [4, 4], [0, 0], [0, 0], [0, 3]], e.OPTABLE = { prefix: { "(": e.MO.OPEN, "+": e.MO.BIN01, "-": e.MO.BIN01, "[": e.MO.OPEN, "{": e.MO.OPEN, "|": e.MO.OPEN, "||": [0, 0, o.TEXCLASS.BIN, { fence: true, stretchy: true, symmetric: true }], "|||": [0, 0, o.TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }], "\xAC": e.MO.ORD21, "\xB1": e.MO.BIN01, "\u2016": [0, 0, o.TEXCLASS.ORD, { fence: true, stretchy: true }], "\u2018": [0, 0, o.TEXCLASS.OPEN, { fence: true }], "\u201C": [0, 0, o.TEXCLASS.OPEN, { fence: true }], "\u2145": e.MO.ORD21, "\u2146": i(2, 0, o.TEXCLASS.ORD), "\u2200": e.MO.ORD21, "\u2202": e.MO.ORD21, "\u2203": e.MO.ORD21, "\u2204": e.MO.ORD21, "\u2207": e.MO.ORD21, "\u220F": e.MO.OP, "\u2210": e.MO.OP, "\u2211": e.MO.OP, "\u2212": e.MO.BIN01, "\u2213": e.MO.BIN01, "\u221A": [1, 1, o.TEXCLASS.ORD, { stretchy: true }], "\u221B": e.MO.ORD11, "\u221C": e.MO.ORD11, "\u2220": e.MO.ORD, "\u2221": e.MO.ORD, "\u2222": e.MO.ORD, "\u222B": e.MO.INTEGRAL, "\u222C": e.MO.INTEGRAL, "\u222D": e.MO.INTEGRAL, "\u222E": e.MO.INTEGRAL, "\u222F": e.MO.INTEGRAL, "\u2230": e.MO.INTEGRAL, "\u2231": e.MO.INTEGRAL, "\u2232": e.MO.INTEGRAL, "\u2233": e.MO.INTEGRAL, "\u22C0": e.MO.OP, "\u22C1": e.MO.OP, "\u22C2": e.MO.OP, "\u22C3": e.MO.OP, "\u2308": e.MO.OPEN, "\u230A": e.MO.OPEN, "\u2329": e.MO.OPEN, "\u2772": e.MO.OPEN, "\u27E6": e.MO.OPEN, "\u27E8": e.MO.OPEN, "\u27EA": e.MO.OPEN, "\u27EC": e.MO.OPEN, "\u27EE": e.MO.OPEN, "\u2980": [0, 0, o.TEXCLASS.ORD, { fence: true, stretchy: true }], "\u2983": e.MO.OPEN, "\u2985": e.MO.OPEN, "\u2987": e.MO.OPEN, "\u2989": e.MO.OPEN, "\u298B": e.MO.OPEN, "\u298D": e.MO.OPEN, "\u298F": e.MO.OPEN, "\u2991": e.MO.OPEN, "\u2993": e.MO.OPEN, "\u2995": e.MO.OPEN, "\u2997": e.MO.OPEN, "\u29FC": e.MO.OPEN, "\u2A00": e.MO.OP, "\u2A01": e.MO.OP, "\u2A02": e.MO.OP, "\u2A03": e.MO.OP, "\u2A04": e.MO.OP, "\u2A05": e.MO.OP, "\u2A06": e.MO.OP, "\u2A07": e.MO.OP, "\u2A08": e.MO.OP, "\u2A09": e.MO.OP, "\u2A0A": e.MO.OP, "\u2A0B": e.MO.INTEGRAL2, "\u2A0C": e.MO.INTEGRAL, "\u2A0D": e.MO.INTEGRAL2, "\u2A0E": e.MO.INTEGRAL2, "\u2A0F": e.MO.INTEGRAL2, "\u2A10": e.MO.OP, "\u2A11": e.MO.OP, "\u2A12": e.MO.OP, "\u2A13": e.MO.OP, "\u2A14": e.MO.OP, "\u2A15": e.MO.INTEGRAL2, "\u2A16": e.MO.INTEGRAL2, "\u2A17": e.MO.INTEGRAL2, "\u2A18": e.MO.INTEGRAL2, "\u2A19": e.MO.INTEGRAL2, "\u2A1A": e.MO.INTEGRAL2, "\u2A1B": e.MO.INTEGRAL2, "\u2A1C": e.MO.INTEGRAL2, "\u2AFC": e.MO.OP, "\u2AFF": e.MO.OP }, postfix: { "!!": i(1, 0), "!": [1, 0, o.TEXCLASS.CLOSE, null], '"': e.MO.ACCENT, "&": e.MO.ORD, ")": e.MO.CLOSE, "++": i(0, 0), "--": i(0, 0), "..": i(0, 0), "...": e.MO.ORD, "'": e.MO.ACCENT, "]": e.MO.CLOSE, "^": e.MO.WIDEACCENT, _: e.MO.WIDEACCENT, "`": e.MO.ACCENT, "|": e.MO.CLOSE, "}": e.MO.CLOSE, "~": e.MO.WIDEACCENT, "||": [0, 0, o.TEXCLASS.BIN, { fence: true, stretchy: true, symmetric: true }], "|||": [0, 0, o.TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }], "\xA8": e.MO.ACCENT, "\xAA": e.MO.ACCENT, "\xAF": e.MO.WIDEACCENT, "\xB0": e.MO.ORD, "\xB2": e.MO.ACCENT, "\xB3": e.MO.ACCENT, "\xB4": e.MO.ACCENT, "\xB8": e.MO.ACCENT, "\xB9": e.MO.ACCENT, "\xBA": e.MO.ACCENT, "\u02C6": e.MO.WIDEACCENT, "\u02C7": e.MO.WIDEACCENT, "\u02C9": e.MO.WIDEACCENT, "\u02CA": e.MO.ACCENT, "\u02CB": e.MO.ACCENT, "\u02CD": e.MO.WIDEACCENT, "\u02D8": e.MO.ACCENT, "\u02D9": e.MO.ACCENT, "\u02DA": e.MO.ACCENT, "\u02DC": e.MO.WIDEACCENT, "\u02DD": e.MO.ACCENT, "\u02F7": e.MO.WIDEACCENT, "\u0302": e.MO.WIDEACCENT, "\u0311": e.MO.ACCENT, "\u03F6": e.MO.REL, "\u2016": [0, 0, o.TEXCLASS.ORD, { fence: true, stretchy: true }], "\u2019": [0, 0, o.TEXCLASS.CLOSE, { fence: true }], "\u201A": e.MO.ACCENT, "\u201B": e.MO.ACCENT, "\u201D": [0, 0, o.TEXCLASS.CLOSE, { fence: true }], "\u201E": e.MO.ACCENT, "\u201F": e.MO.ACCENT, "\u2032": e.MO.ORD, "\u2033": e.MO.ACCENT, "\u2034": e.MO.ACCENT, "\u2035": e.MO.ACCENT, "\u2036": e.MO.ACCENT, "\u2037": e.MO.ACCENT, "\u203E": e.MO.WIDEACCENT, "\u2057": e.MO.ACCENT, "\u20DB": e.MO.ACCENT, "\u20DC": e.MO.ACCENT, "\u2309": e.MO.CLOSE, "\u230B": e.MO.CLOSE, "\u232A": e.MO.CLOSE, "\u23B4": e.MO.WIDEACCENT, "\u23B5": e.MO.WIDEACCENT, "\u23DC": e.MO.WIDEACCENT, "\u23DD": e.MO.WIDEACCENT, "\u23DE": e.MO.WIDEACCENT, "\u23DF": e.MO.WIDEACCENT, "\u23E0": e.MO.WIDEACCENT, "\u23E1": e.MO.WIDEACCENT, "\u25A0": e.MO.BIN3, "\u25A1": e.MO.BIN3, "\u25AA": e.MO.BIN3, "\u25AB": e.MO.BIN3, "\u25AD": e.MO.BIN3, "\u25AE": e.MO.BIN3, "\u25AF": e.MO.BIN3, "\u25B0": e.MO.BIN3, "\u25B1": e.MO.BIN3, "\u25B2": e.MO.BIN4, "\u25B4": e.MO.BIN4, "\u25B6": e.MO.BIN4, "\u25B7": e.MO.BIN4, "\u25B8": e.MO.BIN4, "\u25BC": e.MO.BIN4, "\u25BE": e.MO.BIN4, "\u25C0": e.MO.BIN4, "\u25C1": e.MO.BIN4, "\u25C2": e.MO.BIN4, "\u25C4": e.MO.BIN4, "\u25C5": e.MO.BIN4, "\u25C6": e.MO.BIN4, "\u25C7": e.MO.BIN4, "\u25C8": e.MO.BIN4, "\u25C9": e.MO.BIN4, "\u25CC": e.MO.BIN4, "\u25CD": e.MO.BIN4, "\u25CE": e.MO.BIN4, "\u25CF": e.MO.BIN4, "\u25D6": e.MO.BIN4, "\u25D7": e.MO.BIN4, "\u25E6": e.MO.BIN4, "\u266D": e.MO.ORD02, "\u266E": e.MO.ORD02, "\u266F": e.MO.ORD02, "\u2773": e.MO.CLOSE, "\u27E7": e.MO.CLOSE, "\u27E9": e.MO.CLOSE, "\u27EB": e.MO.CLOSE, "\u27ED": e.MO.CLOSE, "\u27EF": e.MO.CLOSE, "\u2980": [0, 0, o.TEXCLASS.ORD, { fence: true, stretchy: true }], "\u2984": e.MO.CLOSE, "\u2986": e.MO.CLOSE, "\u2988": e.MO.CLOSE, "\u298A": e.MO.CLOSE, "\u298C": e.MO.CLOSE, "\u298E": e.MO.CLOSE, "\u2990": e.MO.CLOSE, "\u2992": e.MO.CLOSE, "\u2994": e.MO.CLOSE, "\u2996": e.MO.CLOSE, "\u2998": e.MO.CLOSE, "\u29FD": e.MO.CLOSE }, infix: { "!=": e.MO.BIN4, "#": e.MO.ORD, $: e.MO.ORD, "%": [3, 3, o.TEXCLASS.ORD, null], "&&": e.MO.BIN4, "": e.MO.ORD, "*": e.MO.BIN3, "**": i(1, 1), "*=": e.MO.BIN4, "+": e.MO.BIN4, "+=": e.MO.BIN4, ",": [0, 3, o.TEXCLASS.PUNCT, { linebreakstyle: "after", separator: true }], "-": e.MO.BIN4, "-=": e.MO.BIN4, "->": e.MO.BIN5, ".": [0, 3, o.TEXCLASS.PUNCT, { separator: true }], "/": e.MO.ORD11, "//": i(1, 1), "/=": e.MO.BIN4, ":": [1, 2, o.TEXCLASS.REL, null], ":=": e.MO.BIN4, ";": [0, 3, o.TEXCLASS.PUNCT, { linebreakstyle: "after", separator: true }], "<": e.MO.REL, "<=": e.MO.BIN5, "<>": i(1, 1), "=": e.MO.REL, "==": e.MO.BIN4, ">": e.MO.REL, ">=": e.MO.BIN5, "?": [1, 1, o.TEXCLASS.CLOSE, null], "@": e.MO.ORD11, "\\": e.MO.ORD, "^": e.MO.ORD11, _: e.MO.ORD11, "|": [2, 2, o.TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }], "||": [2, 2, o.TEXCLASS.BIN, { fence: true, stretchy: true, symmetric: true }], "|||": [2, 2, o.TEXCLASS.ORD, { fence: true, stretchy: true, symmetric: true }], "\xB1": e.MO.BIN4, "\xB7": e.MO.BIN4, "\xD7": e.MO.BIN4, "\xF7": e.MO.BIN4, "\u02B9": e.MO.ORD, "\u0300": e.MO.ACCENT, "\u0301": e.MO.ACCENT, "\u0303": e.MO.WIDEACCENT, "\u0304": e.MO.ACCENT, "\u0306": e.MO.ACCENT, "\u0307": e.MO.ACCENT, "\u0308": e.MO.ACCENT, "\u030C": e.MO.ACCENT, "\u0332": e.MO.WIDEACCENT, "\u0338": e.MO.REL4, "\u2015": [0, 0, o.TEXCLASS.ORD, { stretchy: true }], "\u2017": [0, 0, o.TEXCLASS.ORD, { stretchy: true }], "\u2020": e.MO.BIN3, "\u2021": e.MO.BIN3, "\u2022": e.MO.BIN4, "\u2026": e.MO.INNER, "\u2043": e.MO.BIN4, "\u2044": e.MO.TALLBIN, "\u2061": e.MO.NONE, "\u2062": e.MO.NONE, "\u2063": [0, 0, o.TEXCLASS.NONE, { linebreakstyle: "after", separator: true }], "\u2064": e.MO.NONE, "\u20D7": e.MO.ACCENT, "\u2111": e.MO.ORD, "\u2113": e.MO.ORD, "\u2118": e.MO.ORD, "\u211C": e.MO.ORD, "\u2190": e.MO.WIDEREL, "\u2191": e.MO.RELSTRETCH, "\u2192": e.MO.WIDEREL, "\u2193": e.MO.RELSTRETCH, "\u2194": e.MO.WIDEREL, "\u2195": e.MO.RELSTRETCH, "\u2196": e.MO.RELSTRETCH, "\u2197": e.MO.RELSTRETCH, "\u2198": e.MO.RELSTRETCH, "\u2199": e.MO.RELSTRETCH, "\u219A": e.MO.RELACCENT, "\u219B": e.MO.RELACCENT, "\u219C": e.MO.WIDEREL, "\u219D": e.MO.WIDEREL, "\u219E": e.MO.WIDEREL, "\u219F": e.MO.WIDEREL, "\u21A0": e.MO.WIDEREL, "\u21A1": e.MO.RELSTRETCH, "\u21A2": e.MO.WIDEREL, "\u21A3": e.MO.WIDEREL, "\u21A4": e.MO.WIDEREL, "\u21A5": e.MO.RELSTRETCH, "\u21A6": e.MO.WIDEREL, "\u21A7": e.MO.RELSTRETCH, "\u21A8": e.MO.RELSTRETCH, "\u21A9": e.MO.WIDEREL, "\u21AA": e.MO.WIDEREL, "\u21AB": e.MO.WIDEREL, "\u21AC": e.MO.WIDEREL, "\u21AD": e.MO.WIDEREL, "\u21AE": e.MO.RELACCENT, "\u21AF": e.MO.RELSTRETCH, "\u21B0": e.MO.RELSTRETCH, "\u21B1": e.MO.RELSTRETCH, "\u21B2": e.MO.RELSTRETCH, "\u21B3": e.MO.RELSTRETCH, "\u21B4": e.MO.RELSTRETCH, "\u21B5": e.MO.RELSTRETCH, "\u21B6": e.MO.RELACCENT, "\u21B7": e.MO.RELACCENT, "\u21B8": e.MO.REL, "\u21B9": e.MO.WIDEREL, "\u21BA": e.MO.REL, "\u21BB": e.MO.REL, "\u21BC": e.MO.WIDEREL, "\u21BD": e.MO.WIDEREL, "\u21BE": e.MO.RELSTRETCH, "\u21BF": e.MO.RELSTRETCH, "\u21C0": e.MO.WIDEREL, "\u21C1": e.MO.WIDEREL, "\u21C2": e.MO.RELSTRETCH, "\u21C3": e.MO.RELSTRETCH, "\u21C4": e.MO.WIDEREL, "\u21C5": e.MO.RELSTRETCH, "\u21C6": e.MO.WIDEREL, "\u21C7": e.MO.WIDEREL, "\u21C8": e.MO.RELSTRETCH, "\u21C9": e.MO.WIDEREL, "\u21CA": e.MO.RELSTRETCH, "\u21CB": e.MO.WIDEREL, "\u21CC": e.MO.WIDEREL, "\u21CD": e.MO.RELACCENT, "\u21CE": e.MO.RELACCENT, "\u21CF": e.MO.RELACCENT, "\u21D0": e.MO.WIDEREL, "\u21D1": e.MO.RELSTRETCH, "\u21D2": e.MO.WIDEREL, "\u21D3": e.MO.RELSTRETCH, "\u21D4": e.MO.WIDEREL, "\u21D5": e.MO.RELSTRETCH, "\u21D6": e.MO.RELSTRETCH, "\u21D7": e.MO.RELSTRETCH, "\u21D8": e.MO.RELSTRETCH, "\u21D9": e.MO.RELSTRETCH, "\u21DA": e.MO.WIDEREL, "\u21DB": e.MO.WIDEREL, "\u21DC": e.MO.WIDEREL, "\u21DD": e.MO.WIDEREL, "\u21DE": e.MO.REL, "\u21DF": e.MO.REL, "\u21E0": e.MO.WIDEREL, "\u21E1": e.MO.RELSTRETCH, "\u21E2": e.MO.WIDEREL, "\u21E3": e.MO.RELSTRETCH, "\u21E4": e.MO.WIDEREL, "\u21E5": e.MO.WIDEREL, "\u21E6": e.MO.WIDEREL, "\u21E7": e.MO.RELSTRETCH, "\u21E8": e.MO.WIDEREL, "\u21E9": e.MO.RELSTRETCH, "\u21EA": e.MO.RELSTRETCH, "\u21EB": e.MO.RELSTRETCH, "\u21EC": e.MO.RELSTRETCH, "\u21ED": e.MO.RELSTRETCH, "\u21EE": e.MO.RELSTRETCH, "\u21EF": e.MO.RELSTRETCH, "\u21F0": e.MO.WIDEREL, "\u21F1": e.MO.REL, "\u21F2": e.MO.REL, "\u21F3": e.MO.RELSTRETCH, "\u21F4": e.MO.RELACCENT, "\u21F5": e.MO.RELSTRETCH, "\u21F6": e.MO.WIDEREL, "\u21F7": e.MO.RELACCENT, "\u21F8": e.MO.RELACCENT, "\u21F9": e.MO.RELACCENT, "\u21FA": e.MO.RELACCENT, "\u21FB": e.MO.RELACCENT, "\u21FC": e.MO.RELACCENT, "\u21FD": e.MO.WIDEREL, "\u21FE": e.MO.WIDEREL, "\u21FF": e.MO.WIDEREL, "\u2201": i(1, 2, o.TEXCLASS.ORD), "\u2205": e.MO.ORD, "\u2206": e.MO.BIN3, "\u2208": e.MO.REL, "\u2209": e.MO.REL, "\u220A": e.MO.REL, "\u220B": e.MO.REL, "\u220C": e.MO.REL, "\u220D": e.MO.REL, "\u220E": e.MO.BIN3, "\u2212": e.MO.BIN4, "\u2213": e.MO.BIN4, "\u2214": e.MO.BIN4, "\u2215": e.MO.TALLBIN, "\u2216": e.MO.BIN4, "\u2217": e.MO.BIN4, "\u2218": e.MO.BIN4, "\u2219": e.MO.BIN4, "\u221D": e.MO.REL, "\u221E": e.MO.ORD, "\u221F": e.MO.REL, "\u2223": e.MO.REL, "\u2224": e.MO.REL, "\u2225": e.MO.REL, "\u2226": e.MO.REL, "\u2227": e.MO.BIN4, "\u2228": e.MO.BIN4, "\u2229": e.MO.BIN4, "\u222A": e.MO.BIN4, "\u2234": e.MO.REL, "\u2235": e.MO.REL, "\u2236": e.MO.REL, "\u2237": e.MO.REL, "\u2238": e.MO.BIN4, "\u2239": e.MO.REL, "\u223A": e.MO.BIN4, "\u223B": e.MO.REL, "\u223C": e.MO.REL, "\u223D": e.MO.REL, "\u223D\u0331": e.MO.BIN3, "\u223E": e.MO.REL, "\u223F": e.MO.BIN3, "\u2240": e.MO.BIN4, "\u2241": e.MO.REL, "\u2242": e.MO.REL, "\u2242\u0338": e.MO.REL, "\u2243": e.MO.REL, "\u2244": e.MO.REL, "\u2245": e.MO.REL, "\u2246": e.MO.REL, "\u2247": e.MO.REL, "\u2248": e.MO.REL, "\u2249": e.MO.REL, "\u224A": e.MO.REL, "\u224B": e.MO.REL, "\u224C": e.MO.REL, "\u224D": e.MO.REL, "\u224E": e.MO.REL, "\u224E\u0338": e.MO.REL, "\u224F": e.MO.REL, "\u224F\u0338": e.MO.REL, "\u2250": e.MO.REL, "\u2251": e.MO.REL, "\u2252": e.MO.REL, "\u2253": e.MO.REL, "\u2254": e.MO.REL, "\u2255": e.MO.REL, "\u2256": e.MO.REL, "\u2257": e.MO.REL, "\u2258": e.MO.REL, "\u2259": e.MO.REL, "\u225A": e.MO.REL, "\u225B": e.MO.REL, "\u225C": e.MO.REL, "\u225D": e.MO.REL, "\u225E": e.MO.REL, "\u225F": e.MO.REL, "\u2260": e.MO.REL, "\u2261": e.MO.REL, "\u2262": e.MO.REL, "\u2263": e.MO.REL, "\u2264": e.MO.REL, "\u2265": e.MO.REL, "\u2266": e.MO.REL, "\u2266\u0338": e.MO.REL, "\u2267": e.MO.REL, "\u2268": e.MO.REL, "\u2269": e.MO.REL, "\u226A": e.MO.REL, "\u226A\u0338": e.MO.REL, "\u226B": e.MO.REL, "\u226B\u0338": e.MO.REL, "\u226C": e.MO.REL, "\u226D": e.MO.REL, "\u226E": e.MO.REL, "\u226F": e.MO.REL, "\u2270": e.MO.REL, "\u2271": e.MO.REL, "\u2272": e.MO.REL, "\u2273": e.MO.REL, "\u2274": e.MO.REL, "\u2275": e.MO.REL, "\u2276": e.MO.REL, "\u2277": e.MO.REL, "\u2278": e.MO.REL, "\u2279": e.MO.REL, "\u227A": e.MO.REL, "\u227B": e.MO.REL, "\u227C": e.MO.REL, "\u227D": e.MO.REL, "\u227E": e.MO.REL, "\u227F": e.MO.REL, "\u227F\u0338": e.MO.REL, "\u2280": e.MO.REL, "\u2281": e.MO.REL, "\u2282": e.MO.REL, "\u2282\u20D2": e.MO.REL, "\u2283": e.MO.REL, "\u2283\u20D2": e.MO.REL, "\u2284": e.MO.REL, "\u2285": e.MO.REL, "\u2286": e.MO.REL, "\u2287": e.MO.REL, "\u2288": e.MO.REL, "\u2289": e.MO.REL, "\u228A": e.MO.REL, "\u228B": e.MO.REL, "\u228C": e.MO.BIN4, "\u228D": e.MO.BIN4, "\u228E": e.MO.BIN4, "\u228F": e.MO.REL, "\u228F\u0338": e.MO.REL, "\u2290": e.MO.REL, "\u2290\u0338": e.MO.REL, "\u2291": e.MO.REL, "\u2292": e.MO.REL, "\u2293": e.MO.BIN4, "\u2294": e.MO.BIN4, "\u2295": e.MO.BIN4, "\u2296": e.MO.BIN4, "\u2297": e.MO.BIN4, "\u2298": e.MO.BIN4, "\u2299": e.MO.BIN4, "\u229A": e.MO.BIN4, "\u229B": e.MO.BIN4, "\u229C": e.MO.BIN4, "\u229D": e.MO.BIN4, "\u229E": e.MO.BIN4, "\u229F": e.MO.BIN4, "\u22A0": e.MO.BIN4, "\u22A1": e.MO.BIN4, "\u22A2": e.MO.REL, "\u22A3": e.MO.REL, "\u22A4": e.MO.ORD55, "\u22A5": e.MO.REL, "\u22A6": e.MO.REL, "\u22A7": e.MO.REL, "\u22A8": e.MO.REL, "\u22A9": e.MO.REL, "\u22AA": e.MO.REL, "\u22AB": e.MO.REL, "\u22AC": e.MO.REL, "\u22AD": e.MO.REL, "\u22AE": e.MO.REL, "\u22AF": e.MO.REL, "\u22B0": e.MO.REL, "\u22B1": e.MO.REL, "\u22B2": e.MO.REL, "\u22B3": e.MO.REL, "\u22B4": e.MO.REL, "\u22B5": e.MO.REL, "\u22B6": e.MO.REL, "\u22B7": e.MO.REL, "\u22B8": e.MO.REL, "\u22B9": e.MO.REL, "\u22BA": e.MO.BIN4, "\u22BB": e.MO.BIN4, "\u22BC": e.MO.BIN4, "\u22BD": e.MO.BIN4, "\u22BE": e.MO.BIN3, "\u22BF": e.MO.BIN3, "\u22C4": e.MO.BIN4, "\u22C5": e.MO.BIN4, "\u22C6": e.MO.BIN4, "\u22C7": e.MO.BIN4, "\u22C8": e.MO.REL, "\u22C9": e.MO.BIN4, "\u22CA": e.MO.BIN4, "\u22CB": e.MO.BIN4, "\u22CC": e.MO.BIN4, "\u22CD": e.MO.REL, "\u22CE": e.MO.BIN4, "\u22CF": e.MO.BIN4, "\u22D0": e.MO.REL, "\u22D1": e.MO.REL, "\u22D2": e.MO.BIN4, "\u22D3": e.MO.BIN4, "\u22D4": e.MO.REL, "\u22D5": e.MO.REL, "\u22D6": e.MO.REL, "\u22D7": e.MO.REL, "\u22D8": e.MO.REL, "\u22D9": e.MO.REL, "\u22DA": e.MO.REL, "\u22DB": e.MO.REL, "\u22DC": e.MO.REL, "\u22DD": e.MO.REL, "\u22DE": e.MO.REL, "\u22DF": e.MO.REL, "\u22E0": e.MO.REL, "\u22E1": e.MO.REL, "\u22E2": e.MO.REL, "\u22E3": e.MO.REL, "\u22E4": e.MO.REL, "\u22E5": e.MO.REL, "\u22E6": e.MO.REL, "\u22E7": e.MO.REL, "\u22E8": e.MO.REL, "\u22E9": e.MO.REL, "\u22EA": e.MO.REL, "\u22EB": e.MO.REL, "\u22EC": e.MO.REL, "\u22ED": e.MO.REL, "\u22EE": e.MO.ORD55, "\u22EF": e.MO.INNER, "\u22F0": e.MO.REL, "\u22F1": [5, 5, o.TEXCLASS.INNER, null], "\u22F2": e.MO.REL, "\u22F3": e.MO.REL, "\u22F4": e.MO.REL, "\u22F5": e.MO.REL, "\u22F6": e.MO.REL, "\u22F7": e.MO.REL, "\u22F8": e.MO.REL, "\u22F9": e.MO.REL, "\u22FA": e.MO.REL, "\u22FB": e.MO.REL, "\u22FC": e.MO.REL, "\u22FD": e.MO.REL, "\u22FE": e.MO.REL, "\u22FF": e.MO.REL, "\u2305": e.MO.BIN3, "\u2306": e.MO.BIN3, "\u2322": e.MO.REL4, "\u2323": e.MO.REL4, "\u2329": e.MO.OPEN, "\u232A": e.MO.CLOSE, "\u23AA": e.MO.ORD, "\u23AF": [0, 0, o.TEXCLASS.ORD, { stretchy: true }], "\u23B0": e.MO.OPEN, "\u23B1": e.MO.CLOSE, "\u2500": e.MO.ORD, "\u25B3": e.MO.BIN4, "\u25B5": e.MO.BIN4, "\u25B9": e.MO.BIN4, "\u25BD": e.MO.BIN4, "\u25BF": e.MO.BIN4, "\u25C3": e.MO.BIN4, "\u25EF": e.MO.BIN3, "\u2660": e.MO.ORD, "\u2661": e.MO.ORD, "\u2662": e.MO.ORD, "\u2663": e.MO.ORD, "\u2758": e.MO.REL, "\u27F0": e.MO.RELSTRETCH, "\u27F1": e.MO.RELSTRETCH, "\u27F5": e.MO.WIDEREL, "\u27F6": e.MO.WIDEREL, "\u27F7": e.MO.WIDEREL, "\u27F8": e.MO.WIDEREL, "\u27F9": e.MO.WIDEREL, "\u27FA": e.MO.WIDEREL, "\u27FB": e.MO.WIDEREL, "\u27FC": e.MO.WIDEREL, "\u27FD": e.MO.WIDEREL, "\u27FE": e.MO.WIDEREL, "\u27FF": e.MO.WIDEREL, "\u2900": e.MO.RELACCENT, "\u2901": e.MO.RELACCENT, "\u2902": e.MO.RELACCENT, "\u2903": e.MO.RELACCENT, "\u2904": e.MO.RELACCENT, "\u2905": e.MO.RELACCENT, "\u2906": e.MO.RELACCENT, "\u2907": e.MO.RELACCENT, "\u2908": e.MO.REL, "\u2909": e.MO.REL, "\u290A": e.MO.RELSTRETCH, "\u290B": e.MO.RELSTRETCH, "\u290C": e.MO.WIDEREL, "\u290D": e.MO.WIDEREL, "\u290E": e.MO.WIDEREL, "\u290F": e.MO.WIDEREL, "\u2910": e.MO.WIDEREL, "\u2911": e.MO.RELACCENT, "\u2912": e.MO.RELSTRETCH, "\u2913": e.MO.RELSTRETCH, "\u2914": e.MO.RELACCENT, "\u2915": e.MO.RELACCENT, "\u2916": e.MO.RELACCENT, "\u2917": e.MO.RELACCENT, "\u2918": e.MO.RELACCENT, "\u2919": e.MO.RELACCENT, "\u291A": e.MO.RELACCENT, "\u291B": e.MO.RELACCENT, "\u291C": e.MO.RELACCENT, "\u291D": e.MO.RELACCENT, "\u291E": e.MO.RELACCENT, "\u291F": e.MO.RELACCENT, "\u2920": e.MO.RELACCENT, "\u2921": e.MO.RELSTRETCH, "\u2922": e.MO.RELSTRETCH, "\u2923": e.MO.REL, "\u2924": e.MO.REL, "\u2925": e.MO.REL, "\u2926": e.MO.REL, "\u2927": e.MO.REL, "\u2928": e.MO.REL, "\u2929": e.MO.REL, "\u292A": e.MO.REL, "\u292B": e.MO.REL, "\u292C": e.MO.REL, "\u292D": e.MO.REL, "\u292E": e.MO.REL, "\u292F": e.MO.REL, "\u2930": e.MO.REL, "\u2931": e.MO.REL, "\u2932": e.MO.REL, "\u2933": e.MO.RELACCENT, "\u2934": e.MO.REL, "\u2935": e.MO.REL, "\u2936": e.MO.REL, "\u2937": e.MO.REL, "\u2938": e.MO.REL, "\u2939": e.MO.REL, "\u293A": e.MO.RELACCENT, "\u293B": e.MO.RELACCENT, "\u293C": e.MO.RELACCENT, "\u293D": e.MO.RELACCENT, "\u293E": e.MO.REL, "\u293F": e.MO.REL, "\u2940": e.MO.REL, "\u2941": e.MO.REL, "\u2942": e.MO.RELACCENT, "\u2943": e.MO.RELACCENT, "\u2944": e.MO.RELACCENT, "\u2945": e.MO.RELACCENT, "\u2946": e.MO.RELACCENT, "\u2947": e.MO.RELACCENT, "\u2948": e.MO.RELACCENT, "\u2949": e.MO.REL, "\u294A": e.MO.RELACCENT, "\u294B": e.MO.RELACCENT, "\u294C": e.MO.REL, "\u294D": e.MO.REL, "\u294E": e.MO.WIDEREL, "\u294F": e.MO.RELSTRETCH, "\u2950": e.MO.WIDEREL, "\u2951": e.MO.RELSTRETCH, "\u2952": e.MO.WIDEREL, "\u2953": e.MO.WIDEREL, "\u2954": e.MO.RELSTRETCH, "\u2955": e.MO.RELSTRETCH, "\u2956": e.MO.RELSTRETCH, "\u2957": e.MO.RELSTRETCH, "\u2958": e.MO.RELSTRETCH, "\u2959": e.MO.RELSTRETCH, "\u295A": e.MO.WIDEREL, "\u295B": e.MO.WIDEREL, "\u295C": e.MO.RELSTRETCH, "\u295D": e.MO.RELSTRETCH, "\u295E": e.MO.WIDEREL, "\u295F": e.MO.WIDEREL, "\u2960": e.MO.RELSTRETCH, "\u2961": e.MO.RELSTRETCH, "\u2962": e.MO.RELACCENT, "\u2963": e.MO.REL, "\u2964": e.MO.RELACCENT, "\u2965": e.MO.REL, "\u2966": e.MO.RELACCENT, "\u2967": e.MO.RELACCENT, "\u2968": e.MO.RELACCENT, "\u2969": e.MO.RELACCENT, "\u296A": e.MO.RELACCENT, "\u296B": e.MO.RELACCENT, "\u296C": e.MO.RELACCENT, "\u296D": e.MO.RELACCENT, "\u296E": e.MO.RELSTRETCH, "\u296F": e.MO.RELSTRETCH, "\u2970": e.MO.RELACCENT, "\u2971": e.MO.RELACCENT, "\u2972": e.MO.RELACCENT, "\u2973": e.MO.RELACCENT, "\u2974": e.MO.RELACCENT, "\u2975": e.MO.RELACCENT, "\u2976": e.MO.RELACCENT, "\u2977": e.MO.RELACCENT, "\u2978": e.MO.RELACCENT, "\u2979": e.MO.RELACCENT, "\u297A": e.MO.RELACCENT, "\u297B": e.MO.RELACCENT, "\u297C": e.MO.RELACCENT, "\u297D": e.MO.RELACCENT, "\u297E": e.MO.REL, "\u297F": e.MO.REL, "\u2981": e.MO.BIN3, "\u2982": e.MO.BIN3, "\u2999": e.MO.BIN3, "\u299A": e.MO.BIN3, "\u299B": e.MO.BIN3, "\u299C": e.MO.BIN3, "\u299D": e.MO.BIN3, "\u299E": e.MO.BIN3, "\u299F": e.MO.BIN3, "\u29A0": e.MO.BIN3, "\u29A1": e.MO.BIN3, "\u29A2": e.MO.BIN3, "\u29A3": e.MO.BIN3, "\u29A4": e.MO.BIN3, "\u29A5": e.MO.BIN3, "\u29A6": e.MO.BIN3, "\u29A7": e.MO.BIN3, "\u29A8": e.MO.BIN3, "\u29A9": e.MO.BIN3, "\u29AA": e.MO.BIN3, "\u29AB": e.MO.BIN3, "\u29AC": e.MO.BIN3, "\u29AD": e.MO.BIN3, "\u29AE": e.MO.BIN3, "\u29AF": e.MO.BIN3, "\u29B0": e.MO.BIN3, "\u29B1": e.MO.BIN3, "\u29B2": e.MO.BIN3, "\u29B3": e.MO.BIN3, "\u29B4": e.MO.BIN3, "\u29B5": e.MO.BIN3, "\u29B6": e.MO.BIN4, "\u29B7": e.MO.BIN4, "\u29B8": e.MO.BIN4, "\u29B9": e.MO.BIN4, "\u29BA": e.MO.BIN4, "\u29BB": e.MO.BIN4, "\u29BC": e.MO.BIN4, "\u29BD": e.MO.BIN4, "\u29BE": e.MO.BIN4, "\u29BF": e.MO.BIN4, "\u29C0": e.MO.REL, "\u29C1": e.MO.REL, "\u29C2": e.MO.BIN3, "\u29C3": e.MO.BIN3, "\u29C4": e.MO.BIN4, "\u29C5": e.MO.BIN4, "\u29C6": e.MO.BIN4, "\u29C7": e.MO.BIN4, "\u29C8": e.MO.BIN4, "\u29C9": e.MO.BIN3, "\u29CA": e.MO.BIN3, "\u29CB": e.MO.BIN3, "\u29CC": e.MO.BIN3, "\u29CD": e.MO.BIN3, "\u29CE": e.MO.REL, "\u29CF": e.MO.REL, "\u29CF\u0338": e.MO.REL, "\u29D0": e.MO.REL, "\u29D0\u0338": e.MO.REL, "\u29D1": e.MO.REL, "\u29D2": e.MO.REL, "\u29D3": e.MO.REL, "\u29D4": e.MO.REL, "\u29D5": e.MO.REL, "\u29D6": e.MO.BIN4, "\u29D7": e.MO.BIN4, "\u29D8": e.MO.BIN3, "\u29D9": e.MO.BIN3, "\u29DB": e.MO.BIN3, "\u29DC": e.MO.BIN3, "\u29DD": e.MO.BIN3, "\u29DE": e.MO.REL, "\u29DF": e.MO.BIN3, "\u29E0": e.MO.BIN3, "\u29E1": e.MO.REL, "\u29E2": e.MO.BIN4, "\u29E3": e.MO.REL, "\u29E4": e.MO.REL, "\u29E5": e.MO.REL, "\u29E6": e.MO.REL, "\u29E7": e.MO.BIN3, "\u29E8": e.MO.BIN3, "\u29E9": e.MO.BIN3, "\u29EA": e.MO.BIN3, "\u29EB": e.MO.BIN3, "\u29EC": e.MO.BIN3, "\u29ED": e.MO.BIN3, "\u29EE": e.MO.BIN3, "\u29EF": e.MO.BIN3, "\u29F0": e.MO.BIN3, "\u29F1": e.MO.BIN3, "\u29F2": e.MO.BIN3, "\u29F3": e.MO.BIN3, "\u29F4": e.MO.REL, "\u29F5": e.MO.BIN4, "\u29F6": e.MO.BIN4, "\u29F7": e.MO.BIN4, "\u29F8": e.MO.BIN3, "\u29F9": e.MO.BIN3, "\u29FA": e.MO.BIN3, "\u29FB": e.MO.BIN3, "\u29FE": e.MO.BIN4, "\u29FF": e.MO.BIN4, "\u2A1D": e.MO.BIN3, "\u2A1E": e.MO.BIN3, "\u2A1F": e.MO.BIN3, "\u2A20": e.MO.BIN3, "\u2A21": e.MO.BIN3, "\u2A22": e.MO.BIN4, "\u2A23": e.MO.BIN4, "\u2A24": e.MO.BIN4, "\u2A25": e.MO.BIN4, "\u2A26": e.MO.BIN4, "\u2A27": e.MO.BIN4, "\u2A28": e.MO.BIN4, "\u2A29": e.MO.BIN4, "\u2A2A": e.MO.BIN4, "\u2A2B": e.MO.BIN4, "\u2A2C": e.MO.BIN4, "\u2A2D": e.MO.BIN4, "\u2A2E": e.MO.BIN4, "\u2A2F": e.MO.BIN4, "\u2A30": e.MO.BIN4, "\u2A31": e.MO.BIN4, "\u2A32": e.MO.BIN4, "\u2A33": e.MO.BIN4, "\u2A34": e.MO.BIN4, "\u2A35": e.MO.BIN4, "\u2A36": e.MO.BIN4, "\u2A37": e.MO.BIN4, "\u2A38": e.MO.BIN4, "\u2A39": e.MO.BIN4, "\u2A3A": e.MO.BIN4, "\u2A3B": e.MO.BIN4, "\u2A3C": e.MO.BIN4, "\u2A3D": e.MO.BIN4, "\u2A3E": e.MO.BIN4, "\u2A3F": e.MO.BIN4, "\u2A40": e.MO.BIN4, "\u2A41": e.MO.BIN4, "\u2A42": e.MO.BIN4, "\u2A43": e.MO.BIN4, "\u2A44": e.MO.BIN4, "\u2A45": e.MO.BIN4, "\u2A46": e.MO.BIN4, "\u2A47": e.MO.BIN4, "\u2A48": e.MO.BIN4, "\u2A49": e.MO.BIN4, "\u2A4A": e.MO.BIN4, "\u2A4B": e.MO.BIN4, "\u2A4C": e.MO.BIN4, "\u2A4D": e.MO.BIN4, "\u2A4E": e.MO.BIN4, "\u2A4F": e.MO.BIN4, "\u2A50": e.MO.BIN4, "\u2A51": e.MO.BIN4, "\u2A52": e.MO.BIN4, "\u2A53": e.MO.BIN4, "\u2A54": e.MO.BIN4, "\u2A55": e.MO.BIN4, "\u2A56": e.MO.BIN4, "\u2A57": e.MO.BIN4, "\u2A58": e.MO.BIN4, "\u2A59": e.MO.REL, "\u2A5A": e.MO.BIN4, "\u2A5B": e.MO.BIN4, "\u2A5C": e.MO.BIN4, "\u2A5D": e.MO.BIN4, "\u2A5E": e.MO.BIN4, "\u2A5F": e.MO.BIN4, "\u2A60": e.MO.BIN4, "\u2A61": e.MO.BIN4, "\u2A62": e.MO.BIN4, "\u2A63": e.MO.BIN4, "\u2A64": e.MO.BIN4, "\u2A65": e.MO.BIN4, "\u2A66": e.MO.REL, "\u2A67": e.MO.REL, "\u2A68": e.MO.REL, "\u2A69": e.MO.REL, "\u2A6A": e.MO.REL, "\u2A6B": e.MO.REL, "\u2A6C": e.MO.REL, "\u2A6D": e.MO.REL, "\u2A6E": e.MO.REL, "\u2A6F": e.MO.REL, "\u2A70": e.MO.REL, "\u2A71": e.MO.BIN4, "\u2A72": e.MO.BIN4, "\u2A73": e.MO.REL, "\u2A74": e.MO.REL, "\u2A75": e.MO.REL, "\u2A76": e.MO.REL, "\u2A77": e.MO.REL, "\u2A78": e.MO.REL, "\u2A79": e.MO.REL, "\u2A7A": e.MO.REL, "\u2A7B": e.MO.REL, "\u2A7C": e.MO.REL, "\u2A7D": e.MO.REL, "\u2A7D\u0338": e.MO.REL, "\u2A7E": e.MO.REL, "\u2A7E\u0338": e.MO.REL, "\u2A7F": e.MO.REL, "\u2A80": e.MO.REL, "\u2A81": e.MO.REL, "\u2A82": e.MO.REL, "\u2A83": e.MO.REL, "\u2A84": e.MO.REL, "\u2A85": e.MO.REL, "\u2A86": e.MO.REL, "\u2A87": e.MO.REL, "\u2A88": e.MO.REL, "\u2A89": e.MO.REL, "\u2A8A": e.MO.REL, "\u2A8B": e.MO.REL, "\u2A8C": e.MO.REL, "\u2A8D": e.MO.REL, "\u2A8E": e.MO.REL, "\u2A8F": e.MO.REL, "\u2A90": e.MO.REL, "\u2A91": e.MO.REL, "\u2A92": e.MO.REL, "\u2A93": e.MO.REL, "\u2A94": e.MO.REL, "\u2A95": e.MO.REL, "\u2A96": e.MO.REL, "\u2A97": e.MO.REL, "\u2A98": e.MO.REL, "\u2A99": e.MO.REL, "\u2A9A": e.MO.REL, "\u2A9B": e.MO.REL, "\u2A9C": e.MO.REL, "\u2A9D": e.MO.REL, "\u2A9E": e.MO.REL, "\u2A9F": e.MO.REL, "\u2AA0": e.MO.REL, "\u2AA1": e.MO.REL, "\u2AA1\u0338": e.MO.REL, "\u2AA2": e.MO.REL, "\u2AA2\u0338": e.MO.REL, "\u2AA3": e.MO.REL, "\u2AA4": e.MO.REL, "\u2AA5": e.MO.REL, "\u2AA6": e.MO.REL, "\u2AA7": e.MO.REL, "\u2AA8": e.MO.REL, "\u2AA9": e.MO.REL, "\u2AAA": e.MO.REL, "\u2AAB": e.MO.REL, "\u2AAC": e.MO.REL, "\u2AAD": e.MO.REL, "\u2AAE": e.MO.REL, "\u2AAF": e.MO.REL, "\u2AAF\u0338": e.MO.REL, "\u2AB0": e.MO.REL, "\u2AB0\u0338": e.MO.REL, "\u2AB1": e.MO.REL, "\u2AB2": e.MO.REL, "\u2AB3": e.MO.REL, "\u2AB4": e.MO.REL, "\u2AB5": e.MO.REL, "\u2AB6": e.MO.REL, "\u2AB7": e.MO.REL, "\u2AB8": e.MO.REL, "\u2AB9": e.MO.REL, "\u2ABA": e.MO.REL, "\u2ABB": e.MO.REL, "\u2ABC": e.MO.REL, "\u2ABD": e.MO.REL, "\u2ABE": e.MO.REL, "\u2ABF": e.MO.REL, "\u2AC0": e.MO.REL, "\u2AC1": e.MO.REL, "\u2AC2": e.MO.REL, "\u2AC3": e.MO.REL, "\u2AC4": e.MO.REL, "\u2AC5": e.MO.REL, "\u2AC6": e.MO.REL, "\u2AC7": e.MO.REL, "\u2AC8": e.MO.REL, "\u2AC9": e.MO.REL, "\u2ACA": e.MO.REL, "\u2ACB": e.MO.REL, "\u2ACC": e.MO.REL, "\u2ACD": e.MO.REL, "\u2ACE": e.MO.REL, "\u2ACF": e.MO.REL, "\u2AD0": e.MO.REL, "\u2AD1": e.MO.REL, "\u2AD2": e.MO.REL, "\u2AD3": e.MO.REL, "\u2AD4": e.MO.REL, "\u2AD5": e.MO.REL, "\u2AD6": e.MO.REL, "\u2AD7": e.MO.REL, "\u2AD8": e.MO.REL, "\u2AD9": e.MO.REL, "\u2ADA": e.MO.REL, "\u2ADB": e.MO.REL, "\u2ADD": e.MO.REL, "\u2ADD\u0338": e.MO.REL, "\u2ADE": e.MO.REL, "\u2ADF": e.MO.REL, "\u2AE0": e.MO.REL, "\u2AE1": e.MO.REL, "\u2AE2": e.MO.REL, "\u2AE3": e.MO.REL, "\u2AE4": e.MO.REL, "\u2AE5": e.MO.REL, "\u2AE6": e.MO.REL, "\u2AE7": e.MO.REL, "\u2AE8": e.MO.REL, "\u2AE9": e.MO.REL, "\u2AEA": e.MO.REL, "\u2AEB": e.MO.REL, "\u2AEC": e.MO.REL, "\u2AED": e.MO.REL, "\u2AEE": e.MO.REL, "\u2AEF": e.MO.REL, "\u2AF0": e.MO.REL, "\u2AF1": e.MO.REL, "\u2AF2": e.MO.REL, "\u2AF3": e.MO.REL, "\u2AF4": e.MO.BIN4, "\u2AF5": e.MO.BIN4, "\u2AF6": e.MO.BIN4, "\u2AF7": e.MO.REL, "\u2AF8": e.MO.REL, "\u2AF9": e.MO.REL, "\u2AFA": e.MO.REL, "\u2AFB": e.MO.BIN4, "\u2AFD": e.MO.BIN4, "\u2AFE": e.MO.BIN3, "\u2B45": e.MO.RELSTRETCH, "\u2B46": e.MO.RELSTRETCH, "\u3008": e.MO.OPEN, "\u3009": e.MO.CLOSE, "\uFE37": e.MO.WIDEACCENT, "\uFE38": e.MO.WIDEACCENT } }, e.OPTABLE.infix["^"] = e.MO.WIDEREL, e.OPTABLE.infix._ = e.MO.WIDEREL, e.OPTABLE.infix["\u2ADC"] = e.MO.REL;
        }, 9259: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, a = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.SerializedMmlVisitor = e.toEntity = e.DATAMJX = void 0;
          var s = r(6325), l = r(9007), c = r(450);
          e.DATAMJX = "data-mjx-";
          e.toEntity = function(t2) {
            return "&#x" + t2.codePointAt(0).toString(16).toUpperCase() + ";";
          };
          var u = (function(t2) {
            function r2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(r2, t2), r2.prototype.visitTree = function(t3) {
              return this.visitNode(t3, "");
            }, r2.prototype.visitTextNode = function(t3, e2) {
              return this.quoteHTML(t3.getText());
            }, r2.prototype.visitXMLNode = function(t3, e2) {
              return e2 + t3.getSerializedXML();
            }, r2.prototype.visitInferredMrowNode = function(t3, e2) {
              var r3, n2, o2 = [];
              try {
                for (var a2 = i(t3.childNodes), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                  var l2 = s2.value;
                  o2.push(this.visitNode(l2, e2));
                }
              } catch (t4) {
                r3 = { error: t4 };
              } finally {
                try {
                  s2 && !s2.done && (n2 = a2.return) && n2.call(a2);
                } finally {
                  if (r3) throw r3.error;
                }
              }
              return o2.join("\n");
            }, r2.prototype.visitTeXAtomNode = function(t3, e2) {
              var r3 = this.childNodeMml(t3, e2 + "  ", "\n");
              return e2 + "<mrow" + this.getAttributes(t3) + ">" + (r3.match(/\S/) ? "\n" + r3 + e2 : "") + "</mrow>";
            }, r2.prototype.visitAnnotationNode = function(t3, e2) {
              return e2 + "<annotation" + this.getAttributes(t3) + ">" + this.childNodeMml(t3, "", "") + "</annotation>";
            }, r2.prototype.visitDefault = function(t3, e2) {
              var r3 = t3.kind, n2 = a(t3.isToken || 0 === t3.childNodes.length ? ["", ""] : ["\n", e2], 2), o2 = n2[0], i2 = n2[1], s2 = this.childNodeMml(t3, e2 + "  ", o2);
              return e2 + "<" + r3 + this.getAttributes(t3) + ">" + (s2.match(/\S/) ? o2 + s2 + i2 : "") + "</" + r3 + ">";
            }, r2.prototype.childNodeMml = function(t3, e2, r3) {
              var n2, o2, a2 = "";
              try {
                for (var s2 = i(t3.childNodes), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                  var c2 = l2.value;
                  a2 += this.visitNode(c2, e2) + r3;
                }
              } catch (t4) {
                n2 = { error: t4 };
              } finally {
                try {
                  l2 && !l2.done && (o2 = s2.return) && o2.call(s2);
                } finally {
                  if (n2) throw n2.error;
                }
              }
              return a2;
            }, r2.prototype.getAttributes = function(t3) {
              var e2, r3, n2 = [], o2 = this.constructor.defaultAttributes[t3.kind] || {}, a2 = Object.assign({}, o2, this.getDataAttributes(t3), t3.attributes.getAllAttributes()), s2 = this.constructor.variants;
              a2.hasOwnProperty("mathvariant") && s2.hasOwnProperty(a2.mathvariant) && (a2.mathvariant = s2[a2.mathvariant]);
              try {
                for (var l2 = i(Object.keys(a2)), c2 = l2.next(); !c2.done; c2 = l2.next()) {
                  var u2 = c2.value, p = String(a2[u2]);
                  void 0 !== p && n2.push(u2 + '="' + this.quoteHTML(p) + '"');
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  c2 && !c2.done && (r3 = l2.return) && r3.call(l2);
                } finally {
                  if (e2) throw e2.error;
                }
              }
              return n2.length ? " " + n2.join(" ") : "";
            }, r2.prototype.getDataAttributes = function(t3) {
              var e2 = {}, r3 = t3.attributes.getExplicit("mathvariant"), n2 = this.constructor.variants;
              r3 && n2.hasOwnProperty(r3) && this.setDataAttribute(e2, "variant", r3), t3.getProperty("variantForm") && this.setDataAttribute(e2, "alternate", "1"), t3.getProperty("pseudoscript") && this.setDataAttribute(e2, "pseudoscript", "true"), false === t3.getProperty("autoOP") && this.setDataAttribute(e2, "auto-op", "false");
              var o2 = t3.getProperty("scriptalign");
              o2 && this.setDataAttribute(e2, "script-align", o2);
              var i2 = t3.getProperty("texClass");
              if (void 0 !== i2) {
                var a2 = true;
                if (i2 === l.TEXCLASS.OP && t3.isKind("mi")) {
                  var s2 = t3.getText();
                  a2 = !(s2.length > 1 && s2.match(c.MmlMi.operatorName));
                }
                a2 && this.setDataAttribute(e2, "texclass", i2 < 0 ? "NONE" : l.TEXCLASSNAMES[i2]);
              }
              return t3.getProperty("scriptlevel") && false === t3.getProperty("useHeight") && this.setDataAttribute(e2, "smallmatrix", "true"), e2;
            }, r2.prototype.setDataAttribute = function(t3, r3, n2) {
              t3[e.DATAMJX + r3] = n2;
            }, r2.prototype.quoteHTML = function(t3) {
              return t3.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/[\uD800-\uDBFF]./g, e.toEntity).replace(/[\u0080-\uD7FF\uE000-\uFFFF]/g, e.toEntity);
            }, r2.variants = { "-tex-calligraphic": "script", "-tex-bold-calligraphic": "bold-script", "-tex-oldstyle": "normal", "-tex-bold-oldstyle": "bold", "-tex-mathit": "italic" }, r2.defaultAttributes = { math: { xmlns: "http://www.w3.org/1998/Math/MathML" } }, r2;
          })(s.MmlVisitor);
          e.SerializedMmlVisitor = u;
        }, 2975: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractOutputJax = void 0;
          var n = r(7233), o = r(7525), i = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = {}), this.adaptor = null;
              var e2 = this.constructor;
              this.options = (0, n.userOptions)((0, n.defaultOptions)({}, e2.OPTIONS), t3), this.postFilters = new o.FunctionList();
            }
            return Object.defineProperty(t2.prototype, "name", { get: function() {
              return this.constructor.NAME;
            }, enumerable: false, configurable: true }), t2.prototype.setAdaptor = function(t3) {
              this.adaptor = t3;
            }, t2.prototype.initialize = function() {
            }, t2.prototype.reset = function() {
              for (var t3 = [], e2 = 0; e2 < arguments.length; e2++) t3[e2] = arguments[e2];
            }, t2.prototype.getMetrics = function(t3) {
            }, t2.prototype.styleSheet = function(t3) {
              return null;
            }, t2.prototype.pageElements = function(t3) {
              return null;
            }, t2.prototype.executeFilters = function(t3, e2, r2, n2) {
              var o2 = { math: e2, document: r2, data: n2 };
              return t3.execute(o2), o2.data;
            }, t2.NAME = "generic", t2.OPTIONS = {}, t2;
          })();
          e.AbstractOutputJax = i;
        }, 4574: function(t, e) {
          var r = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, n = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a;
          }, o = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractFactory = void 0;
          var i = (function() {
            function t2(t3) {
              var e2, n2;
              void 0 === t3 && (t3 = null), this.defaultKind = "unknown", this.nodeMap = /* @__PURE__ */ new Map(), this.node = {}, null === t3 && (t3 = this.constructor.defaultNodes);
              try {
                for (var o2 = r(Object.keys(t3)), i2 = o2.next(); !i2.done; i2 = o2.next()) {
                  var a = i2.value;
                  this.setNodeClass(a, t3[a]);
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  i2 && !i2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (e2) throw e2.error;
                }
              }
            }
            return t2.prototype.create = function(t3) {
              for (var e2 = [], r2 = 1; r2 < arguments.length; r2++) e2[r2 - 1] = arguments[r2];
              return (this.node[t3] || this.node[this.defaultKind]).apply(void 0, o([], n(e2), false));
            }, t2.prototype.setNodeClass = function(t3, e2) {
              this.nodeMap.set(t3, e2);
              var r2 = this, i2 = this.nodeMap.get(t3);
              this.node[t3] = function() {
                for (var t4 = [], e3 = 0; e3 < arguments.length; e3++) t4[e3] = arguments[e3];
                return new (i2.bind.apply(i2, o([void 0, r2], n(t4), false)))();
              };
            }, t2.prototype.getNodeClass = function(t3) {
              return this.nodeMap.get(t3);
            }, t2.prototype.deleteNodeClass = function(t3) {
              this.nodeMap.delete(t3), delete this.node[t3];
            }, t2.prototype.nodeIsKind = function(t3, e2) {
              return t3 instanceof this.getNodeClass(e2);
            }, t2.prototype.getKinds = function() {
              return Array.from(this.nodeMap.keys());
            }, t2.defaultNodes = {}, t2;
          })();
          e.AbstractFactory = i;
        }, 4596: function(t, e) {
          var r, n = this && this.__extends || (r = function(t2, e2) {
            return r = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, r(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function n2() {
              this.constructor = t2;
            }
            r(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (n2.prototype = e2.prototype, new n2());
          }), o = this && this.__assign || function() {
            return o = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, o.apply(this, arguments);
          }, i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractEmptyNode = e.AbstractNode = void 0;
          var a = (function() {
            function t2(t3, e2, r2) {
              var n2, o2;
              void 0 === e2 && (e2 = {}), void 0 === r2 && (r2 = []), this.factory = t3, this.parent = null, this.properties = {}, this.childNodes = [];
              try {
                for (var a2 = i(Object.keys(e2)), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                  var l = s2.value;
                  this.setProperty(l, e2[l]);
                }
              } catch (t4) {
                n2 = { error: t4 };
              } finally {
                try {
                  s2 && !s2.done && (o2 = a2.return) && o2.call(a2);
                } finally {
                  if (n2) throw n2.error;
                }
              }
              r2.length && this.setChildren(r2);
            }
            return Object.defineProperty(t2.prototype, "kind", { get: function() {
              return "unknown";
            }, enumerable: false, configurable: true }), t2.prototype.setProperty = function(t3, e2) {
              this.properties[t3] = e2;
            }, t2.prototype.getProperty = function(t3) {
              return this.properties[t3];
            }, t2.prototype.getPropertyNames = function() {
              return Object.keys(this.properties);
            }, t2.prototype.getAllProperties = function() {
              return this.properties;
            }, t2.prototype.removeProperty = function() {
              for (var t3, e2, r2 = [], n2 = 0; n2 < arguments.length; n2++) r2[n2] = arguments[n2];
              try {
                for (var o2 = i(r2), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  var s2 = a2.value;
                  delete this.properties[s2];
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  a2 && !a2.done && (e2 = o2.return) && e2.call(o2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
            }, t2.prototype.isKind = function(t3) {
              return this.factory.nodeIsKind(this, t3);
            }, t2.prototype.setChildren = function(t3) {
              var e2, r2;
              this.childNodes = [];
              try {
                for (var n2 = i(t3), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  var a2 = o2.value;
                  this.appendChild(a2);
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r2 = n2.return) && r2.call(n2);
                } finally {
                  if (e2) throw e2.error;
                }
              }
            }, t2.prototype.appendChild = function(t3) {
              return this.childNodes.push(t3), t3.parent = this, t3;
            }, t2.prototype.replaceChild = function(t3, e2) {
              var r2 = this.childIndex(e2);
              return null !== r2 && (this.childNodes[r2] = t3, t3.parent = this, e2.parent = null), t3;
            }, t2.prototype.removeChild = function(t3) {
              var e2 = this.childIndex(t3);
              return null !== e2 && (this.childNodes.splice(e2, 1), t3.parent = null), t3;
            }, t2.prototype.childIndex = function(t3) {
              var e2 = this.childNodes.indexOf(t3);
              return -1 === e2 ? null : e2;
            }, t2.prototype.copy = function() {
              var t3, e2, r2 = this.factory.create(this.kind);
              r2.properties = o({}, this.properties);
              try {
                for (var n2 = i(this.childNodes || []), a2 = n2.next(); !a2.done; a2 = n2.next()) {
                  var s2 = a2.value;
                  s2 && r2.appendChild(s2.copy());
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  a2 && !a2.done && (e2 = n2.return) && e2.call(n2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return r2;
            }, t2.prototype.findNodes = function(t3) {
              var e2 = [];
              return this.walkTree((function(r2) {
                r2.isKind(t3) && e2.push(r2);
              })), e2;
            }, t2.prototype.walkTree = function(t3, e2) {
              var r2, n2;
              t3(this, e2);
              try {
                for (var o2 = i(this.childNodes), a2 = o2.next(); !a2.done; a2 = o2.next()) {
                  var s2 = a2.value;
                  s2 && s2.walkTree(t3, e2);
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  a2 && !a2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return e2;
            }, t2.prototype.toString = function() {
              return this.kind + "(" + this.childNodes.join(",") + ")";
            }, t2;
          })();
          e.AbstractNode = a;
          var s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return n(e2, t2), e2.prototype.setChildren = function(t3) {
            }, e2.prototype.appendChild = function(t3) {
              return t3;
            }, e2.prototype.replaceChild = function(t3, e3) {
              return e3;
            }, e2.prototype.childIndex = function(t3) {
              return null;
            }, e2.prototype.walkTree = function(t3, e3) {
              return t3(this, e3), e3;
            }, e2.prototype.toString = function() {
              return this.kind;
            }, e2;
          })(a);
          e.AbstractEmptyNode = s;
        }, 7860: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractNodeFactory = void 0;
          var i = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.prototype.create = function(t3, e3, r2) {
              return void 0 === e3 && (e3 = {}), void 0 === r2 && (r2 = []), this.node[t3](e3, r2);
            }, e2;
          })(r(4574).AbstractFactory);
          e.AbstractNodeFactory = i;
        }, 8823: function(t, e, r) {
          var n = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, o = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, i = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractVisitor = void 0;
          var a = r(4596), s = (function() {
            function t2(e2) {
              var r2, o2;
              this.nodeHandlers = /* @__PURE__ */ new Map();
              try {
                for (var i2 = n(e2.getKinds()), a2 = i2.next(); !a2.done; a2 = i2.next()) {
                  var s2 = a2.value, l = this[t2.methodName(s2)];
                  l && this.nodeHandlers.set(s2, l);
                }
              } catch (t3) {
                r2 = { error: t3 };
              } finally {
                try {
                  a2 && !a2.done && (o2 = i2.return) && o2.call(i2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
            }
            return t2.methodName = function(t3) {
              return "visit" + (t3.charAt(0).toUpperCase() + t3.substr(1)).replace(/[^a-z0-9_]/gi, "_") + "Node";
            }, t2.prototype.visitTree = function(t3) {
              for (var e2 = [], r2 = 1; r2 < arguments.length; r2++) e2[r2 - 1] = arguments[r2];
              return this.visitNode.apply(this, i([t3], o(e2), false));
            }, t2.prototype.visitNode = function(t3) {
              for (var e2 = [], r2 = 1; r2 < arguments.length; r2++) e2[r2 - 1] = arguments[r2];
              var n2 = this.nodeHandlers.get(t3.kind) || this.visitDefault;
              return n2.call.apply(n2, i([this, t3], o(e2), false));
            }, t2.prototype.visitDefault = function(t3) {
              for (var e2, r2, s2 = [], l = 1; l < arguments.length; l++) s2[l - 1] = arguments[l];
              if (t3 instanceof a.AbstractNode) try {
                for (var c = n(t3.childNodes), u = c.next(); !u.done; u = c.next()) {
                  var p = u.value;
                  this.visitNode.apply(this, i([p], o(s2), false));
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  u && !u.done && (r2 = c.return) && r2.call(c);
                } finally {
                  if (e2) throw e2.error;
                }
              }
            }, t2.prototype.setNodeHandler = function(t3, e2) {
              this.nodeHandlers.set(t3, e2);
            }, t2.prototype.removeNodeHandler = function(t3) {
              this.nodeHandlers.delete(t3);
            }, t2;
          })();
          e.AbstractVisitor = s;
        }, 8912: function(t, e) {
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractWrapper = void 0;
          var r = (function() {
            function t2(t3, e2) {
              this.factory = t3, this.node = e2;
            }
            return Object.defineProperty(t2.prototype, "kind", { get: function() {
              return this.node.kind;
            }, enumerable: false, configurable: true }), t2.prototype.wrap = function(t3) {
              return this.factory.wrap(t3);
            }, t2;
          })();
          e.AbstractWrapper = r;
        }, 3811: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, a = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.AbstractWrapperFactory = void 0;
          var s = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.prototype.wrap = function(t3) {
              for (var e3 = [], r2 = 1; r2 < arguments.length; r2++) e3[r2 - 1] = arguments[r2];
              return this.create.apply(this, a([t3.kind, t3], i(e3), false));
            }, e2;
          })(r(4574).AbstractFactory);
          e.AbstractWrapperFactory = s;
        }, 6272: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.RegisterHTMLHandler = void 0;
          var n = r(5713), o = r(3726);
          e.RegisterHTMLHandler = function(t2) {
            var e2 = new o.HTMLHandler(t2);
            return n.mathjax.handlers.register(e2), e2;
          };
        }, 3683: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__assign || function() {
            return i = Object.assign || function(t2) {
              for (var e2, r2 = 1, n2 = arguments.length; r2 < n2; r2++) for (var o2 in e2 = arguments[r2]) Object.prototype.hasOwnProperty.call(e2, o2) && (t2[o2] = e2[o2]);
              return t2;
            }, i.apply(this, arguments);
          }, a = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, s = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.HTMLDocument = void 0;
          var l = r(5722), c = r(7233), u = r(3363), p = r(3335), f = r(5138), h = r(4474), d = (function(t2) {
            function e2(e3, r2, n2) {
              var o2 = this, i2 = a((0, c.separateOptions)(n2, f.HTMLDomStrings.OPTIONS), 2), s2 = i2[0], l2 = i2[1];
              return (o2 = t2.call(this, e3, r2, s2) || this).domStrings = o2.options.DomStrings || new f.HTMLDomStrings(l2), o2.domStrings.adaptor = r2, o2.styles = [], o2;
            }
            return o(e2, t2), e2.prototype.findPosition = function(t3, e3, r2, n2) {
              var o2, i2, l2 = this.adaptor;
              try {
                for (var c2 = s(n2[t3]), u2 = c2.next(); !u2.done; u2 = c2.next()) {
                  var p2 = u2.value, f2 = a(p2, 2), h2 = f2[0], d2 = f2[1];
                  if (e3 <= d2 && "#text" === l2.kind(h2)) return { node: h2, n: Math.max(e3, 0), delim: r2 };
                  e3 -= d2;
                }
              } catch (t4) {
                o2 = { error: t4 };
              } finally {
                try {
                  u2 && !u2.done && (i2 = c2.return) && i2.call(c2);
                } finally {
                  if (o2) throw o2.error;
                }
              }
              return { node: null, n: 0, delim: r2 };
            }, e2.prototype.mathItem = function(t3, e3, r2) {
              var n2 = t3.math, o2 = this.findPosition(t3.n, t3.start.n, t3.open, r2), i2 = this.findPosition(t3.n, t3.end.n, t3.close, r2);
              return new this.options.MathItem(n2, e3, t3.display, o2, i2);
            }, e2.prototype.findMath = function(t3) {
              var e3, r2, n2, o2, i2, l2, u2, p2, f2;
              if (!this.processed.isSet("findMath")) {
                this.adaptor.document = this.document, t3 = (0, c.userOptions)({ elements: this.options.elements || [this.adaptor.body(this.document)] }, t3);
                try {
                  for (var h2 = s(this.adaptor.getElements(t3.elements, this.document)), d2 = h2.next(); !d2.done; d2 = h2.next()) {
                    var y = d2.value, O = a([null, null], 2), m = O[0], v = O[1];
                    try {
                      for (var M = (n2 = void 0, s(this.inputJax)), b = M.next(); !b.done; b = M.next()) {
                        var E = b.value, g = new this.options.MathList();
                        if (E.processStrings) {
                          null === m && (m = (i2 = a(this.domStrings.find(y), 2))[0], v = i2[1]);
                          try {
                            for (var L = (l2 = void 0, s(E.findMath(m))), x = L.next(); !x.done; x = L.next()) {
                              var N = x.value;
                              g.push(this.mathItem(N, E, v));
                            }
                          } catch (t4) {
                            l2 = { error: t4 };
                          } finally {
                            try {
                              x && !x.done && (u2 = L.return) && u2.call(L);
                            } finally {
                              if (l2) throw l2.error;
                            }
                          }
                        } else try {
                          for (var _ = (p2 = void 0, s(E.findMath(y))), T = _.next(); !T.done; T = _.next()) {
                            N = T.value;
                            var R = new this.options.MathItem(N.math, E, N.display, N.start, N.end);
                            g.push(R);
                          }
                        } catch (t4) {
                          p2 = { error: t4 };
                        } finally {
                          try {
                            T && !T.done && (f2 = _.return) && f2.call(_);
                          } finally {
                            if (p2) throw p2.error;
                          }
                        }
                        this.math.merge(g);
                      }
                    } catch (t4) {
                      n2 = { error: t4 };
                    } finally {
                      try {
                        b && !b.done && (o2 = M.return) && o2.call(M);
                      } finally {
                        if (n2) throw n2.error;
                      }
                    }
                  }
                } catch (t4) {
                  e3 = { error: t4 };
                } finally {
                  try {
                    d2 && !d2.done && (r2 = h2.return) && r2.call(h2);
                  } finally {
                    if (e3) throw e3.error;
                  }
                }
                this.processed.set("findMath");
              }
              return this;
            }, e2.prototype.updateDocument = function() {
              return this.processed.isSet("updateDocument") || (this.addPageElements(), this.addStyleSheet(), t2.prototype.updateDocument.call(this), this.processed.set("updateDocument")), this;
            }, e2.prototype.addPageElements = function() {
              var t3 = this.adaptor.body(this.document), e3 = this.documentPageElements();
              e3 && this.adaptor.append(t3, e3);
            }, e2.prototype.addStyleSheet = function() {
              var t3 = this.documentStyleSheet(), e3 = this.adaptor;
              if (t3 && !e3.parent(t3)) {
                var r2 = e3.head(this.document), n2 = this.findSheet(r2, e3.getAttribute(t3, "id"));
                n2 ? e3.replace(t3, n2) : e3.append(r2, t3);
              }
            }, e2.prototype.findSheet = function(t3, e3) {
              var r2, n2;
              if (e3) try {
                for (var o2 = s(this.adaptor.tags(t3, "style")), i2 = o2.next(); !i2.done; i2 = o2.next()) {
                  var a2 = i2.value;
                  if (this.adaptor.getAttribute(a2, "id") === e3) return a2;
                }
              } catch (t4) {
                r2 = { error: t4 };
              } finally {
                try {
                  i2 && !i2.done && (n2 = o2.return) && n2.call(o2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              return null;
            }, e2.prototype.removeFromDocument = function(t3) {
              var e3, r2;
              if (void 0 === t3 && (t3 = false), this.processed.isSet("updateDocument")) try {
                for (var n2 = s(this.math), o2 = n2.next(); !o2.done; o2 = n2.next()) {
                  var i2 = o2.value;
                  i2.state() >= h.STATE.INSERTED && i2.state(h.STATE.TYPESET, t3);
                }
              } catch (t4) {
                e3 = { error: t4 };
              } finally {
                try {
                  o2 && !o2.done && (r2 = n2.return) && r2.call(n2);
                } finally {
                  if (e3) throw e3.error;
                }
              }
              return this.processed.clear("updateDocument"), this;
            }, e2.prototype.documentStyleSheet = function() {
              return this.outputJax.styleSheet(this);
            }, e2.prototype.documentPageElements = function() {
              return this.outputJax.pageElements(this);
            }, e2.prototype.addStyles = function(t3) {
              this.styles.push(t3);
            }, e2.prototype.getStyles = function() {
              return this.styles;
            }, e2.KIND = "HTML", e2.OPTIONS = i(i({}, l.AbstractMathDocument.OPTIONS), { renderActions: (0, c.expandable)(i(i({}, l.AbstractMathDocument.OPTIONS.renderActions), { styles: [h.STATE.INSERTED + 1, "", "updateStyleSheet", false] })), MathList: p.HTMLMathList, MathItem: u.HTMLMathItem, DomStrings: null }), e2;
          })(l.AbstractMathDocument);
          e.HTMLDocument = d;
        }, 5138: function(t, e, r) {
          var n = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a;
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.HTMLDomStrings = void 0;
          var o = r(7233), i = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = null);
              var e2 = this.constructor;
              this.options = (0, o.userOptions)((0, o.defaultOptions)({}, e2.OPTIONS), t3), this.init(), this.getPatterns();
            }
            return t2.prototype.init = function() {
              this.strings = [], this.string = "", this.snodes = [], this.nodes = [], this.stack = [];
            }, t2.prototype.getPatterns = function() {
              var t3 = (0, o.makeArray)(this.options.skipHtmlTags), e2 = (0, o.makeArray)(this.options.ignoreHtmlClass), r2 = (0, o.makeArray)(this.options.processHtmlClass);
              this.skipHtmlTags = new RegExp("^(?:" + t3.join("|") + ")$", "i"), this.ignoreHtmlClass = new RegExp("(?:^| )(?:" + e2.join("|") + ")(?: |$)"), this.processHtmlClass = new RegExp("(?:^| )(?:" + r2 + ")(?: |$)");
            }, t2.prototype.pushString = function() {
              this.string.match(/\S/) && (this.strings.push(this.string), this.nodes.push(this.snodes)), this.string = "", this.snodes = [];
            }, t2.prototype.extendString = function(t3, e2) {
              this.snodes.push([t3, e2.length]), this.string += e2;
            }, t2.prototype.handleText = function(t3, e2) {
              return e2 || this.extendString(t3, this.adaptor.value(t3)), this.adaptor.next(t3);
            }, t2.prototype.handleTag = function(t3, e2) {
              if (!e2) {
                var r2 = this.options.includeHtmlTags[this.adaptor.kind(t3)];
                this.extendString(t3, r2);
              }
              return this.adaptor.next(t3);
            }, t2.prototype.handleContainer = function(t3, e2) {
              this.pushString();
              var r2 = this.adaptor.getAttribute(t3, "class") || "", n2 = this.adaptor.kind(t3) || "", o2 = this.processHtmlClass.exec(r2), i2 = t3;
              return !this.adaptor.firstChild(t3) || this.adaptor.getAttribute(t3, "data-MJX") || !o2 && this.skipHtmlTags.exec(n2) ? i2 = this.adaptor.next(t3) : (this.adaptor.next(t3) && this.stack.push([this.adaptor.next(t3), e2]), i2 = this.adaptor.firstChild(t3), e2 = (e2 || this.ignoreHtmlClass.exec(r2)) && !o2), [i2, e2];
            }, t2.prototype.handleOther = function(t3, e2) {
              return this.pushString(), this.adaptor.next(t3);
            }, t2.prototype.find = function(t3) {
              var e2, r2;
              this.init();
              for (var o2 = this.adaptor.next(t3), i2 = false, a = this.options.includeHtmlTags; t3 && t3 !== o2; ) {
                var s = this.adaptor.kind(t3);
                "#text" === s ? t3 = this.handleText(t3, i2) : a.hasOwnProperty(s) ? t3 = this.handleTag(t3, i2) : s ? (t3 = (e2 = n(this.handleContainer(t3, i2), 2))[0], i2 = e2[1]) : t3 = this.handleOther(t3, i2), !t3 && this.stack.length && (this.pushString(), t3 = (r2 = n(this.stack.pop(), 2))[0], i2 = r2[1]);
              }
              this.pushString();
              var l = [this.strings, this.nodes];
              return this.init(), l;
            }, t2.OPTIONS = { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code", "annotation", "annotation-xml"], includeHtmlTags: { br: "\n", wbr: "", "#comment": "" }, ignoreHtmlClass: "mathjax_ignore", processHtmlClass: "mathjax_process" }, t2;
          })();
          e.HTMLDomStrings = i;
        }, 3726: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.HTMLHandler = void 0;
          var i = r(3670), a = r(3683), s = (function(t2) {
            function e2() {
              var e3 = null !== t2 && t2.apply(this, arguments) || this;
              return e3.documentClass = a.HTMLDocument, e3;
            }
            return o(e2, t2), e2.prototype.handlesDocument = function(t3) {
              var e3 = this.adaptor;
              if ("string" == typeof t3) try {
                t3 = e3.parse(t3, "text/html");
              } catch (t4) {
              }
              return t3 instanceof e3.window.Document || t3 instanceof e3.window.HTMLElement || t3 instanceof e3.window.DocumentFragment;
            }, e2.prototype.create = function(e3, r2) {
              var n2 = this.adaptor;
              if ("string" == typeof e3) e3 = n2.parse(e3, "text/html");
              else if (e3 instanceof n2.window.HTMLElement || e3 instanceof n2.window.DocumentFragment) {
                var o2 = e3;
                e3 = n2.parse("", "text/html"), n2.append(n2.body(e3), o2);
              }
              return t2.prototype.create.call(this, e3, r2);
            }, e2;
          })(i.AbstractHandler);
          e.HTMLHandler = s;
        }, 3363: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.HTMLMathItem = void 0;
          var i = r(4474), a = (function(t2) {
            function e2(e3, r2, n2, o2, i2) {
              return void 0 === n2 && (n2 = true), void 0 === o2 && (o2 = { node: null, n: 0, delim: "" }), void 0 === i2 && (i2 = { node: null, n: 0, delim: "" }), t2.call(this, e3, r2, n2, o2, i2) || this;
            }
            return o(e2, t2), Object.defineProperty(e2.prototype, "adaptor", { get: function() {
              return this.inputJax.adaptor;
            }, enumerable: false, configurable: true }), e2.prototype.updateDocument = function(t3) {
              if (this.state() < i.STATE.INSERTED) {
                if (this.inputJax.processStrings) {
                  var e3 = this.start.node;
                  if (e3 === this.end.node) this.end.n && this.end.n < this.adaptor.value(this.end.node).length && this.adaptor.split(this.end.node, this.end.n), this.start.n && (e3 = this.adaptor.split(this.start.node, this.start.n)), this.adaptor.replace(this.typesetRoot, e3);
                  else {
                    for (this.start.n && (e3 = this.adaptor.split(e3, this.start.n)); e3 !== this.end.node; ) {
                      var r2 = this.adaptor.next(e3);
                      this.adaptor.remove(e3), e3 = r2;
                    }
                    this.adaptor.insert(this.typesetRoot, e3), this.end.n < this.adaptor.value(e3).length && this.adaptor.split(e3, this.end.n), this.adaptor.remove(e3);
                  }
                } else this.adaptor.replace(this.typesetRoot, this.start.node);
                this.start.node = this.end.node = this.typesetRoot, this.start.n = this.end.n = 0, this.state(i.STATE.INSERTED);
              }
            }, e2.prototype.updateStyleSheet = function(t3) {
              t3.addStyleSheet();
            }, e2.prototype.removeFromDocument = function(t3) {
              if (void 0 === t3 && (t3 = false), this.state() >= i.STATE.TYPESET) {
                var e3 = this.adaptor, r2 = this.start.node, n2 = e3.text("");
                if (t3) {
                  var o2 = this.start.delim + this.math + this.end.delim;
                  if (this.inputJax.processStrings) n2 = e3.text(o2);
                  else {
                    var a2 = e3.parse(o2, "text/html");
                    n2 = e3.firstChild(e3.body(a2));
                  }
                }
                e3.parent(r2) && e3.replace(n2, r2), this.start.node = this.end.node = n2, this.start.n = this.end.n = 0;
              }
            }, e2;
          })(i.AbstractMathItem);
          e.HTMLMathItem = a;
        }, 3335: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          });
          Object.defineProperty(e, "__esModule", { value: true }), e.HTMLMathList = void 0;
          var i = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2;
          })(r(9e3).AbstractMathList);
          e.HTMLMathList = i;
        }, 5713: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.mathjax = void 0;
          var n = r(3282), o = r(805), i = r(4542);
          e.mathjax = { version: n.VERSION, handlers: new o.HandlerList(), document: function(t2, r2) {
            return e.mathjax.handlers.document(t2, r2);
          }, handleRetriesFor: i.handleRetriesFor, retryAfter: i.retryAfter, asyncLoad: null };
        }, 9923: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.asyncLoad = void 0;
          var n = r(5713);
          e.asyncLoad = function(t2) {
            return n.mathjax.asyncLoad ? new Promise((function(e2, r2) {
              var o = n.mathjax.asyncLoad(t2);
              o instanceof Promise ? o.then((function(t3) {
                return e2(t3);
              })).catch((function(t3) {
                return r2(t3);
              })) : e2(o);
            })) : Promise.reject("Can't load '".concat(t2, "': No asyncLoad method specified"));
          };
        }, 6469: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.BBox = void 0;
          var n = r(6010), o = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = { w: 0, h: -n.BIGDIMEN, d: -n.BIGDIMEN }), this.w = t3.w || 0, this.h = "h" in t3 ? t3.h : -n.BIGDIMEN, this.d = "d" in t3 ? t3.d : -n.BIGDIMEN, this.L = this.R = this.ic = this.sk = this.dx = 0, this.scale = this.rscale = 1, this.pwidth = "";
            }
            return t2.zero = function() {
              return new t2({ h: 0, d: 0, w: 0 });
            }, t2.empty = function() {
              return new t2();
            }, t2.prototype.empty = function() {
              return this.w = 0, this.h = this.d = -n.BIGDIMEN, this;
            }, t2.prototype.clean = function() {
              this.w === -n.BIGDIMEN && (this.w = 0), this.h === -n.BIGDIMEN && (this.h = 0), this.d === -n.BIGDIMEN && (this.d = 0);
            }, t2.prototype.rescale = function(t3) {
              this.w *= t3, this.h *= t3, this.d *= t3;
            }, t2.prototype.combine = function(t3, e2, r2) {
              void 0 === e2 && (e2 = 0), void 0 === r2 && (r2 = 0);
              var n2 = t3.rscale, o2 = e2 + n2 * (t3.w + t3.L + t3.R), i = r2 + n2 * t3.h, a = n2 * t3.d - r2;
              o2 > this.w && (this.w = o2), i > this.h && (this.h = i), a > this.d && (this.d = a);
            }, t2.prototype.append = function(t3) {
              var e2 = t3.rscale;
              this.w += e2 * (t3.w + t3.L + t3.R), e2 * t3.h > this.h && (this.h = e2 * t3.h), e2 * t3.d > this.d && (this.d = e2 * t3.d);
            }, t2.prototype.updateFrom = function(t3) {
              this.h = t3.h, this.d = t3.d, this.w = t3.w, t3.pwidth && (this.pwidth = t3.pwidth);
            }, t2.fullWidth = "100%", t2.StyleAdjust = [["borderTopWidth", "h"], ["borderRightWidth", "w"], ["borderBottomWidth", "d"], ["borderLeftWidth", "w", 0], ["paddingTop", "h"], ["paddingRight", "w"], ["paddingBottom", "d"], ["paddingLeft", "w", 0]], t2;
          })();
          e.BBox = o;
        }, 6751: function(t, e) {
          var r, n = this && this.__extends || (r = function(t2, e2) {
            return r = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, r(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function n2() {
              this.constructor = t2;
            }
            r(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (n2.prototype = e2.prototype, new n2());
          }), o = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, i = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, a = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.BitFieldClass = e.BitField = void 0;
          var s = (function() {
            function t2() {
              this.bits = 0;
            }
            return t2.allocate = function() {
              for (var e2, r2, n2 = [], i2 = 0; i2 < arguments.length; i2++) n2[i2] = arguments[i2];
              try {
                for (var a2 = o(n2), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                  var l = s2.value;
                  if (this.has(l)) throw new Error("Bit already allocated for " + l);
                  if (this.next === t2.MAXBIT) throw new Error("Maximum number of bits already allocated");
                  this.names.set(l, this.next), this.next <<= 1;
                }
              } catch (t3) {
                e2 = { error: t3 };
              } finally {
                try {
                  s2 && !s2.done && (r2 = a2.return) && r2.call(a2);
                } finally {
                  if (e2) throw e2.error;
                }
              }
            }, t2.has = function(t3) {
              return this.names.has(t3);
            }, t2.prototype.set = function(t3) {
              this.bits |= this.getBit(t3);
            }, t2.prototype.clear = function(t3) {
              this.bits &= ~this.getBit(t3);
            }, t2.prototype.isSet = function(t3) {
              return !!(this.bits & this.getBit(t3));
            }, t2.prototype.reset = function() {
              this.bits = 0;
            }, t2.prototype.getBit = function(t3) {
              var e2 = this.constructor.names.get(t3);
              if (!e2) throw new Error("Unknown bit-field name: " + t3);
              return e2;
            }, t2.MAXBIT = 1 << 31, t2.next = 1, t2.names = /* @__PURE__ */ new Map(), t2;
          })();
          e.BitField = s, e.BitFieldClass = function() {
            for (var t2 = [], e2 = 0; e2 < arguments.length; e2++) t2[e2] = arguments[e2];
            var r2 = (function(t3) {
              function e3() {
                return null !== t3 && t3.apply(this, arguments) || this;
              }
              return n(e3, t3), e3;
            })(s);
            return r2.allocate.apply(r2, a([], i(t2), false)), r2;
          };
        }, 5368: function(t, e, r) {
          Object.defineProperty(e, "__esModule", { value: true }), e.numeric = e.translate = e.remove = e.add = e.entities = e.options = void 0;
          var n = r(4542), o = r(9923);
          e.options = { loadMissingEntities: true }, e.entities = { ApplyFunction: "\u2061", Backslash: "\u2216", Because: "\u2235", Breve: "\u02D8", Cap: "\u22D2", CenterDot: "\xB7", CircleDot: "\u2299", CircleMinus: "\u2296", CirclePlus: "\u2295", CircleTimes: "\u2297", Congruent: "\u2261", ContourIntegral: "\u222E", Coproduct: "\u2210", Cross: "\u2A2F", Cup: "\u22D3", CupCap: "\u224D", Dagger: "\u2021", Del: "\u2207", Delta: "\u0394", Diamond: "\u22C4", DifferentialD: "\u2146", DotEqual: "\u2250", DoubleDot: "\xA8", DoubleRightTee: "\u22A8", DoubleVerticalBar: "\u2225", DownArrow: "\u2193", DownLeftVector: "\u21BD", DownRightVector: "\u21C1", DownTee: "\u22A4", Downarrow: "\u21D3", Element: "\u2208", EqualTilde: "\u2242", Equilibrium: "\u21CC", Exists: "\u2203", ExponentialE: "\u2147", FilledVerySmallSquare: "\u25AA", ForAll: "\u2200", Gamma: "\u0393", Gg: "\u22D9", GreaterEqual: "\u2265", GreaterEqualLess: "\u22DB", GreaterFullEqual: "\u2267", GreaterLess: "\u2277", GreaterSlantEqual: "\u2A7E", GreaterTilde: "\u2273", Hacek: "\u02C7", Hat: "^", HumpDownHump: "\u224E", HumpEqual: "\u224F", Im: "\u2111", ImaginaryI: "\u2148", Integral: "\u222B", Intersection: "\u22C2", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", Lambda: "\u039B", Larr: "\u219E", LeftAngleBracket: "\u27E8", LeftArrow: "\u2190", LeftArrowRightArrow: "\u21C6", LeftCeiling: "\u2308", LeftDownVector: "\u21C3", LeftFloor: "\u230A", LeftRightArrow: "\u2194", LeftTee: "\u22A3", LeftTriangle: "\u22B2", LeftTriangleEqual: "\u22B4", LeftUpVector: "\u21BF", LeftVector: "\u21BC", Leftarrow: "\u21D0", Leftrightarrow: "\u21D4", LessEqualGreater: "\u22DA", LessFullEqual: "\u2266", LessGreater: "\u2276", LessSlantEqual: "\u2A7D", LessTilde: "\u2272", Ll: "\u22D8", Lleftarrow: "\u21DA", LongLeftArrow: "\u27F5", LongLeftRightArrow: "\u27F7", LongRightArrow: "\u27F6", Longleftarrow: "\u27F8", Longleftrightarrow: "\u27FA", Longrightarrow: "\u27F9", Lsh: "\u21B0", MinusPlus: "\u2213", NestedGreaterGreater: "\u226B", NestedLessLess: "\u226A", NotDoubleVerticalBar: "\u2226", NotElement: "\u2209", NotEqual: "\u2260", NotExists: "\u2204", NotGreater: "\u226F", NotGreaterEqual: "\u2271", NotLeftTriangle: "\u22EA", NotLeftTriangleEqual: "\u22EC", NotLess: "\u226E", NotLessEqual: "\u2270", NotPrecedes: "\u2280", NotPrecedesSlantEqual: "\u22E0", NotRightTriangle: "\u22EB", NotRightTriangleEqual: "\u22ED", NotSubsetEqual: "\u2288", NotSucceeds: "\u2281", NotSucceedsSlantEqual: "\u22E1", NotSupersetEqual: "\u2289", NotTilde: "\u2241", NotVerticalBar: "\u2224", Omega: "\u03A9", OverBar: "\u203E", OverBrace: "\u23DE", PartialD: "\u2202", Phi: "\u03A6", Pi: "\u03A0", PlusMinus: "\xB1", Precedes: "\u227A", PrecedesEqual: "\u2AAF", PrecedesSlantEqual: "\u227C", PrecedesTilde: "\u227E", Product: "\u220F", Proportional: "\u221D", Psi: "\u03A8", Rarr: "\u21A0", Re: "\u211C", ReverseEquilibrium: "\u21CB", RightAngleBracket: "\u27E9", RightArrow: "\u2192", RightArrowLeftArrow: "\u21C4", RightCeiling: "\u2309", RightDownVector: "\u21C2", RightFloor: "\u230B", RightTee: "\u22A2", RightTeeArrow: "\u21A6", RightTriangle: "\u22B3", RightTriangleEqual: "\u22B5", RightUpVector: "\u21BE", RightVector: "\u21C0", Rightarrow: "\u21D2", Rrightarrow: "\u21DB", Rsh: "\u21B1", Sigma: "\u03A3", SmallCircle: "\u2218", Sqrt: "\u221A", Square: "\u25A1", SquareIntersection: "\u2293", SquareSubset: "\u228F", SquareSubsetEqual: "\u2291", SquareSuperset: "\u2290", SquareSupersetEqual: "\u2292", SquareUnion: "\u2294", Star: "\u22C6", Subset: "\u22D0", SubsetEqual: "\u2286", Succeeds: "\u227B", SucceedsEqual: "\u2AB0", SucceedsSlantEqual: "\u227D", SucceedsTilde: "\u227F", SuchThat: "\u220B", Sum: "\u2211", Superset: "\u2283", SupersetEqual: "\u2287", Supset: "\u22D1", Therefore: "\u2234", Theta: "\u0398", Tilde: "\u223C", TildeEqual: "\u2243", TildeFullEqual: "\u2245", TildeTilde: "\u2248", UnderBar: "_", UnderBrace: "\u23DF", Union: "\u22C3", UnionPlus: "\u228E", UpArrow: "\u2191", UpDownArrow: "\u2195", UpTee: "\u22A5", Uparrow: "\u21D1", Updownarrow: "\u21D5", Upsilon: "\u03A5", Vdash: "\u22A9", Vee: "\u22C1", VerticalBar: "\u2223", VerticalTilde: "\u2240", Vvdash: "\u22AA", Wedge: "\u22C0", Xi: "\u039E", amp: "&", acute: "\xB4", aleph: "\u2135", alpha: "\u03B1", amalg: "\u2A3F", and: "\u2227", ang: "\u2220", angmsd: "\u2221", angsph: "\u2222", ape: "\u224A", backprime: "\u2035", backsim: "\u223D", backsimeq: "\u22CD", beta: "\u03B2", beth: "\u2136", between: "\u226C", bigcirc: "\u25EF", bigodot: "\u2A00", bigoplus: "\u2A01", bigotimes: "\u2A02", bigsqcup: "\u2A06", bigstar: "\u2605", bigtriangledown: "\u25BD", bigtriangleup: "\u25B3", biguplus: "\u2A04", blacklozenge: "\u29EB", blacktriangle: "\u25B4", blacktriangledown: "\u25BE", blacktriangleleft: "\u25C2", bowtie: "\u22C8", boxdl: "\u2510", boxdr: "\u250C", boxminus: "\u229F", boxplus: "\u229E", boxtimes: "\u22A0", boxul: "\u2518", boxur: "\u2514", bsol: "\\", bull: "\u2022", cap: "\u2229", check: "\u2713", chi: "\u03C7", circ: "\u02C6", circeq: "\u2257", circlearrowleft: "\u21BA", circlearrowright: "\u21BB", circledR: "\xAE", circledS: "\u24C8", circledast: "\u229B", circledcirc: "\u229A", circleddash: "\u229D", clubs: "\u2663", colon: ":", comp: "\u2201", ctdot: "\u22EF", cuepr: "\u22DE", cuesc: "\u22DF", cularr: "\u21B6", cup: "\u222A", curarr: "\u21B7", curlyvee: "\u22CE", curlywedge: "\u22CF", dagger: "\u2020", daleth: "\u2138", ddarr: "\u21CA", deg: "\xB0", delta: "\u03B4", digamma: "\u03DD", div: "\xF7", divideontimes: "\u22C7", dot: "\u02D9", doteqdot: "\u2251", dotplus: "\u2214", dotsquare: "\u22A1", dtdot: "\u22F1", ecir: "\u2256", efDot: "\u2252", egs: "\u2A96", ell: "\u2113", els: "\u2A95", empty: "\u2205", epsi: "\u03B5", epsiv: "\u03F5", erDot: "\u2253", eta: "\u03B7", eth: "\xF0", flat: "\u266D", fork: "\u22D4", frown: "\u2322", gEl: "\u2A8C", gamma: "\u03B3", gap: "\u2A86", gimel: "\u2137", gnE: "\u2269", gnap: "\u2A8A", gne: "\u2A88", gnsim: "\u22E7", gt: ">", gtdot: "\u22D7", harrw: "\u21AD", hbar: "\u210F", hellip: "\u2026", hookleftarrow: "\u21A9", hookrightarrow: "\u21AA", imath: "\u0131", infin: "\u221E", intcal: "\u22BA", iota: "\u03B9", jmath: "\u0237", kappa: "\u03BA", kappav: "\u03F0", lEg: "\u2A8B", lambda: "\u03BB", lap: "\u2A85", larrlp: "\u21AB", larrtl: "\u21A2", lbrace: "{", lbrack: "[", le: "\u2264", leftleftarrows: "\u21C7", leftthreetimes: "\u22CB", lessdot: "\u22D6", lmoust: "\u23B0", lnE: "\u2268", lnap: "\u2A89", lne: "\u2A87", lnsim: "\u22E6", longmapsto: "\u27FC", looparrowright: "\u21AC", lowast: "\u2217", loz: "\u25CA", lt: "<", ltimes: "\u22C9", ltri: "\u25C3", macr: "\xAF", malt: "\u2720", mho: "\u2127", mu: "\u03BC", multimap: "\u22B8", nLeftarrow: "\u21CD", nLeftrightarrow: "\u21CE", nRightarrow: "\u21CF", nVDash: "\u22AF", nVdash: "\u22AE", natur: "\u266E", nearr: "\u2197", nharr: "\u21AE", nlarr: "\u219A", not: "\xAC", nrarr: "\u219B", nu: "\u03BD", nvDash: "\u22AD", nvdash: "\u22AC", nwarr: "\u2196", omega: "\u03C9", omicron: "\u03BF", or: "\u2228", osol: "\u2298", period: ".", phi: "\u03C6", phiv: "\u03D5", pi: "\u03C0", piv: "\u03D6", prap: "\u2AB7", precnapprox: "\u2AB9", precneqq: "\u2AB5", precnsim: "\u22E8", prime: "\u2032", psi: "\u03C8", quot: '"', rarrtl: "\u21A3", rbrace: "}", rbrack: "]", rho: "\u03C1", rhov: "\u03F1", rightrightarrows: "\u21C9", rightthreetimes: "\u22CC", ring: "\u02DA", rmoust: "\u23B1", rtimes: "\u22CA", rtri: "\u25B9", scap: "\u2AB8", scnE: "\u2AB6", scnap: "\u2ABA", scnsim: "\u22E9", sdot: "\u22C5", searr: "\u2198", sect: "\xA7", sharp: "\u266F", sigma: "\u03C3", sigmav: "\u03C2", simne: "\u2246", smile: "\u2323", spades: "\u2660", sub: "\u2282", subE: "\u2AC5", subnE: "\u2ACB", subne: "\u228A", supE: "\u2AC6", supnE: "\u2ACC", supne: "\u228B", swarr: "\u2199", tau: "\u03C4", theta: "\u03B8", thetav: "\u03D1", tilde: "\u02DC", times: "\xD7", triangle: "\u25B5", triangleq: "\u225C", upsi: "\u03C5", upuparrows: "\u21C8", veebar: "\u22BB", vellip: "\u22EE", weierp: "\u2118", xi: "\u03BE", yen: "\xA5", zeta: "\u03B6", zigrarr: "\u21DD", nbsp: "\xA0", rsquo: "\u2019", lsquo: "\u2018" };
          var i = {};
          function a(t2, r2) {
            if ("#" === r2.charAt(0)) return s(r2.slice(1));
            if (e.entities[r2]) return e.entities[r2];
            if (e.options.loadMissingEntities) {
              var a2 = r2.match(/^[a-zA-Z](fr|scr|opf)$/) ? RegExp.$1 : r2.charAt(0).toLowerCase();
              i[a2] || (i[a2] = true, (0, n.retryAfter)((0, o.asyncLoad)("./util/entities/" + a2 + ".js")));
            }
            return t2;
          }
          function s(t2) {
            var e2 = "x" === t2.charAt(0) ? parseInt(t2.slice(1), 16) : parseInt(t2);
            return String.fromCodePoint(e2);
          }
          e.add = function(t2, r2) {
            Object.assign(e.entities, t2), i[r2] = true;
          }, e.remove = function(t2) {
            delete e.entities[t2];
          }, e.translate = function(t2) {
            return t2.replace(/&([a-z][a-z0-9]*|#(?:[0-9]+|x[0-9a-f]+));/gi, a);
          }, e.numeric = s;
        }, 7525: function(t, e, r) {
          var n, o = this && this.__extends || (n = function(t2, e2) {
            return n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t3, e3) {
              t3.__proto__ = e3;
            } || function(t3, e3) {
              for (var r2 in e3) Object.prototype.hasOwnProperty.call(e3, r2) && (t3[r2] = e3[r2]);
            }, n(t2, e2);
          }, function(t2, e2) {
            if ("function" != typeof e2 && null !== e2) throw new TypeError("Class extends value " + String(e2) + " is not a constructor or null");
            function r2() {
              this.constructor = t2;
            }
            n(t2, e2), t2.prototype = null === e2 ? Object.create(e2) : (r2.prototype = e2.prototype, new r2());
          }), i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, a = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, s = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.FunctionList = void 0;
          var l = (function(t2) {
            function e2() {
              return null !== t2 && t2.apply(this, arguments) || this;
            }
            return o(e2, t2), e2.prototype.execute = function() {
              for (var t3, e3, r2 = [], n2 = 0; n2 < arguments.length; n2++) r2[n2] = arguments[n2];
              try {
                for (var o2 = i(this), l2 = o2.next(); !l2.done; l2 = o2.next()) {
                  var c = l2.value, u = c.item.apply(c, s([], a(r2), false));
                  if (false === u) return false;
                }
              } catch (e4) {
                t3 = { error: e4 };
              } finally {
                try {
                  l2 && !l2.done && (e3 = o2.return) && e3.call(o2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return true;
            }, e2.prototype.asyncExecute = function() {
              for (var t3 = [], e3 = 0; e3 < arguments.length; e3++) t3[e3] = arguments[e3];
              var r2 = -1, n2 = this.items;
              return new Promise((function(e4, o2) {
                !(function i2() {
                  for (var l2; ++r2 < n2.length; ) {
                    var c = (l2 = n2[r2]).item.apply(l2, s([], a(t3), false));
                    if (c instanceof Promise) return void c.then(i2).catch((function(t4) {
                      return o2(t4);
                    }));
                    if (false === c) return void e4(false);
                  }
                  e4(true);
                })();
              }));
            }, e2;
          })(r(8666).PrioritizedList);
          e.FunctionList = l;
        }, 103: function(t, e) {
          var r = this && this.__generator || function(t2, e2) {
            var r2, n2, o2, i2, a2 = { label: 0, sent: function() {
              if (1 & o2[0]) throw o2[1];
              return o2[1];
            }, trys: [], ops: [] };
            return i2 = { next: s2(0), throw: s2(1), return: s2(2) }, "function" == typeof Symbol && (i2[Symbol.iterator] = function() {
              return this;
            }), i2;
            function s2(i3) {
              return function(s3) {
                return (function(i4) {
                  if (r2) throw new TypeError("Generator is already executing.");
                  for (; a2; ) try {
                    if (r2 = 1, n2 && (o2 = 2 & i4[0] ? n2.return : i4[0] ? n2.throw || ((o2 = n2.return) && o2.call(n2), 0) : n2.next) && !(o2 = o2.call(n2, i4[1])).done) return o2;
                    switch (n2 = 0, o2 && (i4 = [2 & i4[0], o2.value]), i4[0]) {
                      case 0:
                      case 1:
                        o2 = i4;
                        break;
                      case 4:
                        return a2.label++, { value: i4[1], done: false };
                      case 5:
                        a2.label++, n2 = i4[1], i4 = [0];
                        continue;
                      case 7:
                        i4 = a2.ops.pop(), a2.trys.pop();
                        continue;
                      default:
                        if (!(o2 = a2.trys, (o2 = o2.length > 0 && o2[o2.length - 1]) || 6 !== i4[0] && 2 !== i4[0])) {
                          a2 = 0;
                          continue;
                        }
                        if (3 === i4[0] && (!o2 || i4[1] > o2[0] && i4[1] < o2[3])) {
                          a2.label = i4[1];
                          break;
                        }
                        if (6 === i4[0] && a2.label < o2[1]) {
                          a2.label = o2[1], o2 = i4;
                          break;
                        }
                        if (o2 && a2.label < o2[2]) {
                          a2.label = o2[2], a2.ops.push(i4);
                          break;
                        }
                        o2[2] && a2.ops.pop(), a2.trys.pop();
                        continue;
                    }
                    i4 = e2.call(t2, a2);
                  } catch (t3) {
                    i4 = [6, t3], n2 = 0;
                  } finally {
                    r2 = o2 = 0;
                  }
                  if (5 & i4[0]) throw i4[1];
                  return { value: i4[0] ? i4[1] : void 0, done: true };
                })([i3, s3]);
              };
            }
          }, n = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, o = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          }, i = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.LinkedList = e.ListItem = e.END = void 0, e.END = Symbol();
          var a = function(t2) {
            void 0 === t2 && (t2 = null), this.next = null, this.prev = null, this.data = t2;
          };
          e.ListItem = a;
          var s = (function() {
            function t2() {
              for (var t3 = [], r2 = 0; r2 < arguments.length; r2++) t3[r2] = arguments[r2];
              this.list = new a(e.END), this.list.next = this.list.prev = this.list, this.push.apply(this, o([], n(t3), false));
            }
            return t2.prototype.isBefore = function(t3, e2) {
              return t3 < e2;
            }, t2.prototype.push = function() {
              for (var t3, e2, r2 = [], n2 = 0; n2 < arguments.length; n2++) r2[n2] = arguments[n2];
              try {
                for (var o2 = i(r2), s2 = o2.next(); !s2.done; s2 = o2.next()) {
                  var l = s2.value, c = new a(l);
                  c.next = this.list, c.prev = this.list.prev, this.list.prev = c, c.prev.next = c;
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  s2 && !s2.done && (e2 = o2.return) && e2.call(o2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return this;
            }, t2.prototype.pop = function() {
              var t3 = this.list.prev;
              return t3.data === e.END ? null : (this.list.prev = t3.prev, t3.prev.next = this.list, t3.next = t3.prev = null, t3.data);
            }, t2.prototype.unshift = function() {
              for (var t3, e2, r2 = [], n2 = 0; n2 < arguments.length; n2++) r2[n2] = arguments[n2];
              try {
                for (var o2 = i(r2.slice(0).reverse()), s2 = o2.next(); !s2.done; s2 = o2.next()) {
                  var l = s2.value, c = new a(l);
                  c.next = this.list.next, c.prev = this.list, this.list.next = c, c.next.prev = c;
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  s2 && !s2.done && (e2 = o2.return) && e2.call(o2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return this;
            }, t2.prototype.shift = function() {
              var t3 = this.list.next;
              return t3.data === e.END ? null : (this.list.next = t3.next, t3.next.prev = this.list, t3.next = t3.prev = null, t3.data);
            }, t2.prototype.remove = function() {
              for (var t3, r2, n2 = [], o2 = 0; o2 < arguments.length; o2++) n2[o2] = arguments[o2];
              var a2 = /* @__PURE__ */ new Map();
              try {
                for (var s2 = i(n2), l = s2.next(); !l.done; l = s2.next()) {
                  var c = l.value;
                  a2.set(c, true);
                }
              } catch (e2) {
                t3 = { error: e2 };
              } finally {
                try {
                  l && !l.done && (r2 = s2.return) && r2.call(s2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              for (var u = this.list.next; u.data !== e.END; ) {
                var p = u.next;
                a2.has(u.data) && (u.prev.next = u.next, u.next.prev = u.prev, u.next = u.prev = null), u = p;
              }
            }, t2.prototype.clear = function() {
              return this.list.next.prev = this.list.prev.next = null, this.list.next = this.list.prev = this.list, this;
            }, t2.prototype[Symbol.iterator] = function() {
              var t3;
              return r(this, (function(r2) {
                switch (r2.label) {
                  case 0:
                    t3 = this.list.next, r2.label = 1;
                  case 1:
                    return t3.data === e.END ? [3, 3] : [4, t3.data];
                  case 2:
                    return r2.sent(), t3 = t3.next, [3, 1];
                  case 3:
                    return [2];
                }
              }));
            }, t2.prototype.reversed = function() {
              var t3;
              return r(this, (function(r2) {
                switch (r2.label) {
                  case 0:
                    t3 = this.list.prev, r2.label = 1;
                  case 1:
                    return t3.data === e.END ? [3, 3] : [4, t3.data];
                  case 2:
                    return r2.sent(), t3 = t3.prev, [3, 1];
                  case 3:
                    return [2];
                }
              }));
            }, t2.prototype.insert = function(t3, r2) {
              void 0 === r2 && (r2 = null), null === r2 && (r2 = this.isBefore.bind(this));
              for (var n2 = new a(t3), o2 = this.list.next; o2.data !== e.END && r2(o2.data, n2.data); ) o2 = o2.next;
              return n2.prev = o2.prev, n2.next = o2, o2.prev.next = o2.prev = n2, this;
            }, t2.prototype.sort = function(e2) {
              var r2, n2;
              void 0 === e2 && (e2 = null), null === e2 && (e2 = this.isBefore.bind(this));
              var o2 = [];
              try {
                for (var a2 = i(this), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                  var l = s2.value;
                  o2.push(new t2(l));
                }
              } catch (t3) {
                r2 = { error: t3 };
              } finally {
                try {
                  s2 && !s2.done && (n2 = a2.return) && n2.call(a2);
                } finally {
                  if (r2) throw r2.error;
                }
              }
              for (this.list.next = this.list.prev = this.list; o2.length > 1; ) {
                var c = o2.shift(), u = o2.shift();
                c.merge(u, e2), o2.push(c);
              }
              return o2.length && (this.list = o2[0].list), this;
            }, t2.prototype.merge = function(t3, r2) {
              var o2, i2, a2, s2, l;
              void 0 === r2 && (r2 = null), null === r2 && (r2 = this.isBefore.bind(this));
              for (var c = this.list.next, u = t3.list.next; c.data !== e.END && u.data !== e.END; ) r2(u.data, c.data) ? (o2 = n([c, u], 2), u.prev.next = o2[0], c.prev.next = o2[1], i2 = n([c.prev, u.prev], 2), u.prev = i2[0], c.prev = i2[1], a2 = n([t3.list, this.list], 2), this.list.prev.next = a2[0], t3.list.prev.next = a2[1], s2 = n([t3.list.prev, this.list.prev], 2), this.list.prev = s2[0], t3.list.prev = s2[1], c = (l = n([u.next, c], 2))[0], u = l[1]) : c = c.next;
              return u.data !== e.END && (this.list.prev.next = t3.list.next, t3.list.next.prev = this.list.prev, t3.list.prev.next = this.list, this.list.prev = t3.list.prev, t3.list.next = t3.list.prev = t3.list), this;
            }, t2;
          })();
          e.LinkedList = s;
        }, 7233: function(t, e) {
          var r = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, n = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, o = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.lookup = e.separateOptions = e.selectOptionsFromKeys = e.selectOptions = e.userOptions = e.defaultOptions = e.insert = e.copy = e.keys = e.makeArray = e.expandable = e.Expandable = e.OPTIONS = e.REMOVE = e.APPEND = e.isObject = void 0;
          var i = {}.constructor;
          function a(t2) {
            return "object" == typeof t2 && null !== t2 && (t2.constructor === i || t2.constructor === s);
          }
          e.isObject = a, e.APPEND = "[+]", e.REMOVE = "[-]", e.OPTIONS = { invalidOption: "warn", optionError: function(t2, r2) {
            if ("fatal" === e.OPTIONS.invalidOption) throw new Error(t2);
            console.warn("MathJax: " + t2);
          } };
          var s = function() {
          };
          function l(t2) {
            return Object.assign(Object.create(s.prototype), t2);
          }
          function c(t2) {
            return t2 ? Object.keys(t2).concat(Object.getOwnPropertySymbols(t2)) : [];
          }
          function u(t2) {
            var e2, n2, o2 = {};
            try {
              for (var i2 = r(c(t2)), f2 = i2.next(); !f2.done; f2 = i2.next()) {
                var h = f2.value, d = Object.getOwnPropertyDescriptor(t2, h), y = d.value;
                Array.isArray(y) ? d.value = p([], y, false) : a(y) && (d.value = u(y)), d.enumerable && (o2[h] = d);
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                f2 && !f2.done && (n2 = i2.return) && n2.call(i2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            return Object.defineProperties(t2.constructor === s ? l({}) : {}, o2);
          }
          function p(t2, i2, l2) {
            var f2, h;
            void 0 === l2 && (l2 = true);
            var d = function(r2) {
              if (l2 && void 0 === t2[r2] && t2.constructor !== s) return "symbol" == typeof r2 && (r2 = r2.toString()), e.OPTIONS.optionError('Invalid option "'.concat(r2, '" (no default value).'), r2), "continue";
              var f3 = i2[r2], h2 = t2[r2];
              if (!a(f3) || null === h2 || "object" != typeof h2 && "function" != typeof h2) Array.isArray(f3) ? (t2[r2] = [], p(t2[r2], f3, false)) : a(f3) ? t2[r2] = u(f3) : t2[r2] = f3;
              else {
                var d2 = c(f3);
                Array.isArray(h2) && (1 === d2.length && (d2[0] === e.APPEND || d2[0] === e.REMOVE) && Array.isArray(f3[d2[0]]) || 2 === d2.length && d2.sort().join(",") === e.APPEND + "," + e.REMOVE && Array.isArray(f3[e.APPEND]) && Array.isArray(f3[e.REMOVE])) ? (f3[e.REMOVE] && (h2 = t2[r2] = h2.filter((function(t3) {
                  return f3[e.REMOVE].indexOf(t3) < 0;
                }))), f3[e.APPEND] && (t2[r2] = o(o([], n(h2), false), n(f3[e.APPEND]), false))) : p(h2, f3, l2);
              }
            };
            try {
              for (var y = r(c(i2)), O = y.next(); !O.done; O = y.next()) {
                d(O.value);
              }
            } catch (t3) {
              f2 = { error: t3 };
            } finally {
              try {
                O && !O.done && (h = y.return) && h.call(y);
              } finally {
                if (f2) throw f2.error;
              }
            }
            return t2;
          }
          function f(t2) {
            for (var e2, n2, o2 = [], i2 = 1; i2 < arguments.length; i2++) o2[i2 - 1] = arguments[i2];
            var a2 = {};
            try {
              for (var s2 = r(o2), l2 = s2.next(); !l2.done; l2 = s2.next()) {
                var c2 = l2.value;
                t2.hasOwnProperty(c2) && (a2[c2] = t2[c2]);
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                l2 && !l2.done && (n2 = s2.return) && n2.call(s2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            return a2;
          }
          e.Expandable = s, e.expandable = l, e.makeArray = function(t2) {
            return Array.isArray(t2) ? t2 : [t2];
          }, e.keys = c, e.copy = u, e.insert = p, e.defaultOptions = function(t2) {
            for (var e2 = [], r2 = 1; r2 < arguments.length; r2++) e2[r2 - 1] = arguments[r2];
            return e2.forEach((function(e3) {
              return p(t2, e3, false);
            })), t2;
          }, e.userOptions = function(t2) {
            for (var e2 = [], r2 = 1; r2 < arguments.length; r2++) e2[r2 - 1] = arguments[r2];
            return e2.forEach((function(e3) {
              return p(t2, e3, true);
            })), t2;
          }, e.selectOptions = f, e.selectOptionsFromKeys = function(t2, e2) {
            return f.apply(void 0, o([t2], n(Object.keys(e2)), false));
          }, e.separateOptions = function(t2) {
            for (var e2, n2, o2, i2, a2 = [], s2 = 1; s2 < arguments.length; s2++) a2[s2 - 1] = arguments[s2];
            var l2 = [];
            try {
              for (var c2 = r(a2), u2 = c2.next(); !u2.done; u2 = c2.next()) {
                var p2 = u2.value, f2 = {}, h = {};
                try {
                  for (var d = (o2 = void 0, r(Object.keys(t2 || {}))), y = d.next(); !y.done; y = d.next()) {
                    var O = y.value;
                    (void 0 === p2[O] ? h : f2)[O] = t2[O];
                  }
                } catch (t3) {
                  o2 = { error: t3 };
                } finally {
                  try {
                    y && !y.done && (i2 = d.return) && i2.call(d);
                  } finally {
                    if (o2) throw o2.error;
                  }
                }
                l2.push(f2), t2 = h;
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                u2 && !u2.done && (n2 = c2.return) && n2.call(c2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            return l2.unshift(t2), l2;
          }, e.lookup = function(t2, e2, r2) {
            return void 0 === r2 && (r2 = null), e2.hasOwnProperty(t2) ? e2[t2] : r2;
          };
        }, 8666: function(t, e) {
          Object.defineProperty(e, "__esModule", { value: true }), e.PrioritizedList = void 0;
          var r = (function() {
            function t2() {
              this.items = [], this.items = [];
            }
            return t2.prototype[Symbol.iterator] = function() {
              var t3 = 0, e2 = this.items;
              return { next: function() {
                return { value: e2[t3++], done: t3 > e2.length };
              } };
            }, t2.prototype.add = function(e2, r2) {
              void 0 === r2 && (r2 = t2.DEFAULTPRIORITY);
              var n = this.items.length;
              do {
                n--;
              } while (n >= 0 && r2 < this.items[n].priority);
              return this.items.splice(n + 1, 0, { item: e2, priority: r2 }), e2;
            }, t2.prototype.remove = function(t3) {
              var e2 = this.items.length;
              do {
                e2--;
              } while (e2 >= 0 && this.items[e2].item !== t3);
              e2 >= 0 && this.items.splice(e2, 1);
            }, t2.DEFAULTPRIORITY = 5, t2;
          })();
          e.PrioritizedList = r;
        }, 4542: function(t, e) {
          Object.defineProperty(e, "__esModule", { value: true }), e.retryAfter = e.handleRetriesFor = void 0, e.handleRetriesFor = function(t2) {
            return new Promise((function e2(r, n) {
              try {
                r(t2());
              } catch (t3) {
                t3.retry && t3.retry instanceof Promise ? t3.retry.then((function() {
                  return e2(r, n);
                })).catch((function(t4) {
                  return n(t4);
                })) : t3.restart && t3.restart.isCallback ? MathJax.Callback.After((function() {
                  return e2(r, n);
                }), t3.restart) : n(t3);
              }
            }));
          }, e.retryAfter = function(t2) {
            var e2 = new Error("MathJax retry");
            throw e2.retry = t2, e2;
          };
        }, 4139: function(t, e) {
          var r = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.CssStyles = void 0;
          var n = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = null), this.styles = {}, this.addStyles(t3);
            }
            return Object.defineProperty(t2.prototype, "cssText", { get: function() {
              return this.getStyleString();
            }, enumerable: false, configurable: true }), t2.prototype.addStyles = function(t3) {
              var e2, n2;
              if (t3) try {
                for (var o = r(Object.keys(t3)), i = o.next(); !i.done; i = o.next()) {
                  var a = i.value;
                  this.styles[a] || (this.styles[a] = {}), Object.assign(this.styles[a], t3[a]);
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  i && !i.done && (n2 = o.return) && n2.call(o);
                } finally {
                  if (e2) throw e2.error;
                }
              }
            }, t2.prototype.removeStyles = function() {
              for (var t3, e2, n2 = [], o = 0; o < arguments.length; o++) n2[o] = arguments[o];
              try {
                for (var i = r(n2), a = i.next(); !a.done; a = i.next()) {
                  var s = a.value;
                  delete this.styles[s];
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  a && !a.done && (e2 = i.return) && e2.call(i);
                } finally {
                  if (t3) throw t3.error;
                }
              }
            }, t2.prototype.clear = function() {
              this.styles = {};
            }, t2.prototype.getStyleString = function() {
              return this.getStyleRules().join("\n\n");
            }, t2.prototype.getStyleRules = function() {
              var t3, e2, n2 = Object.keys(this.styles), o = new Array(n2.length), i = 0;
              try {
                for (var a = r(n2), s = a.next(); !s.done; s = a.next()) {
                  var l = s.value;
                  o[i++] = l + " {\n" + this.getStyleDefString(this.styles[l]) + "\n}";
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  s && !s.done && (e2 = a.return) && e2.call(a);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return o;
            }, t2.prototype.getStyleDefString = function(t3) {
              var e2, n2, o = Object.keys(t3), i = new Array(o.length), a = 0;
              try {
                for (var s = r(o), l = s.next(); !l.done; l = s.next()) {
                  var c = l.value;
                  i[a++] = "  " + c + ": " + t3[c] + ";";
                }
              } catch (t4) {
                e2 = { error: t4 };
              } finally {
                try {
                  l && !l.done && (n2 = s.return) && n2.call(s);
                } finally {
                  if (e2) throw e2.error;
                }
              }
              return i.join("\n");
            }, t2;
          })();
          e.CssStyles = n;
        }, 8054: function(t, e) {
          var r = this && this.__values || function(t2) {
            var e2 = "function" == typeof Symbol && Symbol.iterator, r2 = e2 && t2[e2], n2 = 0;
            if (r2) return r2.call(t2);
            if (t2 && "number" == typeof t2.length) return { next: function() {
              return t2 && n2 >= t2.length && (t2 = void 0), { value: t2 && t2[n2++], done: !t2 };
            } };
            throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }, n = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o2, i2 = r2.call(t2), a2 = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i2.next()).done; ) a2.push(n2.value);
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i2.return) && r2.call(i2);
              } finally {
                if (o2) throw o2.error;
              }
            }
            return a2;
          }, o = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o2 = 0, i2 = e2.length; o2 < i2; o2++) !n2 && o2 in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o2)), n2[o2] = e2[o2]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.Styles = void 0;
          var i = ["top", "right", "bottom", "left"], a = ["width", "style", "color"];
          function s(t2) {
            for (var e2 = t2.split(/((?:'[^']*'|"[^"]*"|,[\s\n]|[^\s\n])*)/g), r2 = []; e2.length > 1; ) e2.shift(), r2.push(e2.shift());
            return r2;
          }
          function l(t2) {
            var e2, n2, o2 = s(this.styles[t2]);
            0 === o2.length && o2.push(""), 1 === o2.length && o2.push(o2[0]), 2 === o2.length && o2.push(o2[0]), 3 === o2.length && o2.push(o2[1]);
            try {
              for (var i2 = r(M.connect[t2].children), a2 = i2.next(); !a2.done; a2 = i2.next()) {
                var l2 = a2.value;
                this.setStyle(this.childName(t2, l2), o2.shift());
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                a2 && !a2.done && (n2 = i2.return) && n2.call(i2);
              } finally {
                if (e2) throw e2.error;
              }
            }
          }
          function c(t2) {
            var e2, n2, o2 = M.connect[t2].children, i2 = [];
            try {
              for (var a2 = r(o2), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                var l2 = s2.value, c2 = this.styles[t2 + "-" + l2];
                if (!c2) return void delete this.styles[t2];
                i2.push(c2);
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                s2 && !s2.done && (n2 = a2.return) && n2.call(a2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            i2[3] === i2[1] && (i2.pop(), i2[2] === i2[0] && (i2.pop(), i2[1] === i2[0] && i2.pop())), this.styles[t2] = i2.join(" ");
          }
          function u(t2) {
            var e2, n2;
            try {
              for (var o2 = r(M.connect[t2].children), i2 = o2.next(); !i2.done; i2 = o2.next()) {
                var a2 = i2.value;
                this.setStyle(this.childName(t2, a2), this.styles[t2]);
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                i2 && !i2.done && (n2 = o2.return) && n2.call(o2);
              } finally {
                if (e2) throw e2.error;
              }
            }
          }
          function p(t2) {
            var e2, i2, a2 = o([], n(M.connect[t2].children), false), s2 = this.styles[this.childName(t2, a2.shift())];
            try {
              for (var l2 = r(a2), c2 = l2.next(); !c2.done; c2 = l2.next()) {
                var u2 = c2.value;
                if (this.styles[this.childName(t2, u2)] !== s2) return void delete this.styles[t2];
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                c2 && !c2.done && (i2 = l2.return) && i2.call(l2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            this.styles[t2] = s2;
          }
          var f = /^(?:[\d.]+(?:[a-z]+)|thin|medium|thick|inherit|initial|unset)$/, h = /^(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit|initial|unset)$/;
          function d(t2) {
            var e2, n2, o2, i2, a2 = { width: "", style: "", color: "" };
            try {
              for (var l2 = r(s(this.styles[t2])), c2 = l2.next(); !c2.done; c2 = l2.next()) {
                var u2 = c2.value;
                u2.match(f) && "" === a2.width ? a2.width = u2 : u2.match(h) && "" === a2.style ? a2.style = u2 : a2.color = u2;
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                c2 && !c2.done && (n2 = l2.return) && n2.call(l2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            try {
              for (var p2 = r(M.connect[t2].children), d2 = p2.next(); !d2.done; d2 = p2.next()) {
                var y2 = d2.value;
                this.setStyle(this.childName(t2, y2), a2[y2]);
              }
            } catch (t3) {
              o2 = { error: t3 };
            } finally {
              try {
                d2 && !d2.done && (i2 = p2.return) && i2.call(p2);
              } finally {
                if (o2) throw o2.error;
              }
            }
          }
          function y(t2) {
            var e2, n2, o2 = [];
            try {
              for (var i2 = r(M.connect[t2].children), a2 = i2.next(); !a2.done; a2 = i2.next()) {
                var s2 = a2.value, l2 = this.styles[this.childName(t2, s2)];
                l2 && o2.push(l2);
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                a2 && !a2.done && (n2 = i2.return) && n2.call(i2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            o2.length ? this.styles[t2] = o2.join(" ") : delete this.styles[t2];
          }
          var O = { style: /^(?:normal|italic|oblique|inherit|initial|unset)$/, variant: new RegExp("^(?:" + ["normal|none", "inherit|initial|unset", "common-ligatures|no-common-ligatures", "discretionary-ligatures|no-discretionary-ligatures", "historical-ligatures|no-historical-ligatures", "contextual|no-contextual", "(?:stylistic|character-variant|swash|ornaments|annotation)\\([^)]*\\)", "small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps", "lining-nums|oldstyle-nums|proportional-nums|tabular-nums", "diagonal-fractions|stacked-fractions", "ordinal|slashed-zero", "jis78|jis83|jis90|jis04|simplified|traditional", "full-width|proportional-width", "ruby"].join("|") + ")$"), weight: /^(?:normal|bold|bolder|lighter|[1-9]00|inherit|initial|unset)$/, stretch: new RegExp("^(?:" + ["normal", "(?:(?:ultra|extra|semi)-)?condensed", "(?:(?:semi|extra|ulta)-)?expanded", "inherit|initial|unset"].join("|") + ")$"), size: new RegExp("^(?:" + ["xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller", "[d.]+%|[d.]+[a-z]+", "inherit|initial|unset"].join("|") + ")(?:/(?:normal|[d.+](?:%|[a-z]+)?))?$") };
          function m(t2) {
            var e2, o2, i2, a2, l2 = s(this.styles[t2]), c2 = { style: "", variant: [], weight: "", stretch: "", size: "", family: "", "line-height": "" };
            try {
              for (var u2 = r(l2), p2 = u2.next(); !p2.done; p2 = u2.next()) {
                var f2 = p2.value;
                c2.family = f2;
                try {
                  for (var h2 = (i2 = void 0, r(Object.keys(O))), d2 = h2.next(); !d2.done; d2 = h2.next()) {
                    var y2 = d2.value;
                    if ((Array.isArray(c2[y2]) || "" === c2[y2]) && f2.match(O[y2])) if ("size" === y2) {
                      var m2 = n(f2.split(/\//), 2), v2 = m2[0], b = m2[1];
                      c2[y2] = v2, b && (c2["line-height"] = b);
                    } else "" === c2.size && (Array.isArray(c2[y2]) ? c2[y2].push(f2) : c2[y2] = f2);
                  }
                } catch (t3) {
                  i2 = { error: t3 };
                } finally {
                  try {
                    d2 && !d2.done && (a2 = h2.return) && a2.call(h2);
                  } finally {
                    if (i2) throw i2.error;
                  }
                }
              }
            } catch (t3) {
              e2 = { error: t3 };
            } finally {
              try {
                p2 && !p2.done && (o2 = u2.return) && o2.call(u2);
              } finally {
                if (e2) throw e2.error;
              }
            }
            !(function(t3, e3) {
              var n2, o3;
              try {
                for (var i3 = r(M.connect[t3].children), a3 = i3.next(); !a3.done; a3 = i3.next()) {
                  var s2 = a3.value, l3 = this.childName(t3, s2);
                  if (Array.isArray(e3[s2])) {
                    var c3 = e3[s2];
                    c3.length && (this.styles[l3] = c3.join(" "));
                  } else "" !== e3[s2] && (this.styles[l3] = e3[s2]);
                }
              } catch (t4) {
                n2 = { error: t4 };
              } finally {
                try {
                  a3 && !a3.done && (o3 = i3.return) && o3.call(i3);
                } finally {
                  if (n2) throw n2.error;
                }
              }
            })(t2, c2), delete this.styles[t2];
          }
          function v(t2) {
          }
          var M = (function() {
            function t2(t3) {
              void 0 === t3 && (t3 = ""), this.parse(t3);
            }
            return Object.defineProperty(t2.prototype, "cssText", { get: function() {
              var t3, e2, n2 = [];
              try {
                for (var o2 = r(Object.keys(this.styles)), i2 = o2.next(); !i2.done; i2 = o2.next()) {
                  var a2 = i2.value, s2 = this.parentName(a2);
                  this.styles[s2] || n2.push(a2 + ": " + this.styles[a2] + ";");
                }
              } catch (e3) {
                t3 = { error: e3 };
              } finally {
                try {
                  i2 && !i2.done && (e2 = o2.return) && e2.call(o2);
                } finally {
                  if (t3) throw t3.error;
                }
              }
              return n2.join(" ");
            }, enumerable: false, configurable: true }), t2.prototype.set = function(e2, r2) {
              for (e2 = this.normalizeName(e2), this.setStyle(e2, r2), t2.connect[e2] && !t2.connect[e2].combine && (this.combineChildren(e2), delete this.styles[e2]); e2.match(/-/) && (e2 = this.parentName(e2), t2.connect[e2]); ) t2.connect[e2].combine.call(this, e2);
            }, t2.prototype.get = function(t3) {
              return t3 = this.normalizeName(t3), this.styles.hasOwnProperty(t3) ? this.styles[t3] : "";
            }, t2.prototype.setStyle = function(e2, r2) {
              this.styles[e2] = r2, t2.connect[e2] && t2.connect[e2].children && t2.connect[e2].split.call(this, e2), "" === r2 && delete this.styles[e2];
            }, t2.prototype.combineChildren = function(e2) {
              var n2, o2, i2 = this.parentName(e2);
              try {
                for (var a2 = r(t2.connect[e2].children), s2 = a2.next(); !s2.done; s2 = a2.next()) {
                  var l2 = s2.value, c2 = this.childName(i2, l2);
                  t2.connect[c2].combine.call(this, c2);
                }
              } catch (t3) {
                n2 = { error: t3 };
              } finally {
                try {
                  s2 && !s2.done && (o2 = a2.return) && o2.call(a2);
                } finally {
                  if (n2) throw n2.error;
                }
              }
            }, t2.prototype.parentName = function(t3) {
              var e2 = t3.replace(/-[^-]*$/, "");
              return t3 === e2 ? "" : e2;
            }, t2.prototype.childName = function(e2, r2) {
              return r2.match(/-/) ? r2 : (t2.connect[e2] && !t2.connect[e2].combine && (r2 += e2.replace(/.*-/, "-"), e2 = this.parentName(e2)), e2 + "-" + r2);
            }, t2.prototype.normalizeName = function(t3) {
              return t3.replace(/[A-Z]/g, (function(t4) {
                return "-" + t4.toLowerCase();
              }));
            }, t2.prototype.parse = function(t3) {
              void 0 === t3 && (t3 = "");
              var e2 = this.constructor.pattern;
              this.styles = {};
              for (var r2 = t3.replace(e2.comment, "").split(e2.style); r2.length > 1; ) {
                var o2 = n(r2.splice(0, 3), 3), i2 = o2[0], a2 = o2[1], s2 = o2[2];
                if (i2.match(/[^\s\n]/)) return;
                this.set(a2, s2);
              }
            }, t2.pattern = { style: /([-a-z]+)[\s\n]*:[\s\n]*((?:'[^']*'|"[^"]*"|\n|.)*?)[\s\n]*(?:;|$)/g, comment: /\/\*[^]*?\*\//g }, t2.connect = { padding: { children: i, split: l, combine: c }, border: { children: i, split: u, combine: p }, "border-top": { children: a, split: d, combine: y }, "border-right": { children: a, split: d, combine: y }, "border-bottom": { children: a, split: d, combine: y }, "border-left": { children: a, split: d, combine: y }, "border-width": { children: i, split: l, combine: null }, "border-style": { children: i, split: l, combine: null }, "border-color": { children: i, split: l, combine: null }, font: { children: ["style", "variant", "weight", "stretch", "line-height", "size", "family"], split: m, combine: v } }, t2;
          })();
          e.Styles = M;
        }, 6010: function(t, e) {
          Object.defineProperty(e, "__esModule", { value: true }), e.px = e.emRounded = e.em = e.percent = e.length2em = e.MATHSPACE = e.RELUNITS = e.UNITS = e.BIGDIMEN = void 0, e.BIGDIMEN = 1e6, e.UNITS = { px: 1, in: 96, cm: 96 / 2.54, mm: 96 / 25.4 }, e.RELUNITS = { em: 1, ex: 0.431, pt: 0.1, pc: 1.2, mu: 1 / 18 }, e.MATHSPACE = { veryverythinmathspace: 1 / 18, verythinmathspace: 2 / 18, thinmathspace: 3 / 18, mediummathspace: 4 / 18, thickmathspace: 5 / 18, verythickmathspace: 6 / 18, veryverythickmathspace: 7 / 18, negativeveryverythinmathspace: -1 / 18, negativeverythinmathspace: -2 / 18, negativethinmathspace: -3 / 18, negativemediummathspace: -4 / 18, negativethickmathspace: -5 / 18, negativeverythickmathspace: -6 / 18, negativeveryverythickmathspace: -7 / 18, thin: 0.04, medium: 0.06, thick: 0.1, normal: 1, big: 2, small: 1 / Math.sqrt(2), infinity: e.BIGDIMEN }, e.length2em = function(t2, r, n, o) {
            if (void 0 === r && (r = 0), void 0 === n && (n = 1), void 0 === o && (o = 16), "string" != typeof t2 && (t2 = String(t2)), "" === t2 || null == t2) return r;
            if (e.MATHSPACE[t2]) return e.MATHSPACE[t2];
            var i = t2.match(/^\s*([-+]?(?:\.\d+|\d+(?:\.\d*)?))?(pt|em|ex|mu|px|pc|in|mm|cm|%)?/);
            if (!i) return r;
            var a = parseFloat(i[1] || "1"), s = i[2];
            return e.UNITS.hasOwnProperty(s) ? a * e.UNITS[s] / o / n : e.RELUNITS.hasOwnProperty(s) ? a * e.RELUNITS[s] : "%" === s ? a / 100 * r : a * r;
          }, e.percent = function(t2) {
            return (100 * t2).toFixed(1).replace(/\.?0+$/, "") + "%";
          }, e.em = function(t2) {
            return Math.abs(t2) < 1e-3 ? "0" : t2.toFixed(3).replace(/\.?0+$/, "") + "em";
          }, e.emRounded = function(t2, e2) {
            return void 0 === e2 && (e2 = 16), t2 = (Math.round(t2 * e2) + 0.05) / e2, Math.abs(t2) < 1e-3 ? "0em" : t2.toFixed(3).replace(/\.?0+$/, "") + "em";
          }, e.px = function(t2, r, n) {
            return void 0 === r && (r = -e.BIGDIMEN), void 0 === n && (n = 16), t2 *= n, r && t2 < r && (t2 = r), Math.abs(t2) < 0.1 ? "0" : t2.toFixed(1).replace(/\.0$/, "") + "px";
          };
        }, 7875: function(t, e) {
          Object.defineProperty(e, "__esModule", { value: true }), e.max = e.sum = void 0, e.sum = function(t2) {
            return t2.reduce((function(t3, e2) {
              return t3 + e2;
            }), 0);
          }, e.max = function(t2) {
            return t2.reduce((function(t3, e2) {
              return Math.max(t3, e2);
            }), 0);
          };
        }, 505: function(t, e) {
          var r = this && this.__read || function(t2, e2) {
            var r2 = "function" == typeof Symbol && t2[Symbol.iterator];
            if (!r2) return t2;
            var n2, o, i = r2.call(t2), a = [];
            try {
              for (; (void 0 === e2 || e2-- > 0) && !(n2 = i.next()).done; ) a.push(n2.value);
            } catch (t3) {
              o = { error: t3 };
            } finally {
              try {
                n2 && !n2.done && (r2 = i.return) && r2.call(i);
              } finally {
                if (o) throw o.error;
              }
            }
            return a;
          }, n = this && this.__spreadArray || function(t2, e2, r2) {
            if (r2 || 2 === arguments.length) for (var n2, o = 0, i = e2.length; o < i; o++) !n2 && o in e2 || (n2 || (n2 = Array.prototype.slice.call(e2, 0, o)), n2[o] = e2[o]);
            return t2.concat(n2 || Array.prototype.slice.call(e2));
          };
          Object.defineProperty(e, "__esModule", { value: true }), e.split = e.isPercent = e.unicodeString = e.unicodeChars = e.quotePattern = e.sortLength = void 0, e.sortLength = function(t2, e2) {
            return t2.length !== e2.length ? e2.length - t2.length : t2 === e2 ? 0 : t2 < e2 ? -1 : 1;
          }, e.quotePattern = function(t2) {
            return t2.replace(/([\^$(){}+*?\-|\[\]\:\\])/g, "\\$1");
          }, e.unicodeChars = function(t2) {
            return Array.from(t2).map((function(t3) {
              return t3.codePointAt(0);
            }));
          }, e.unicodeString = function(t2) {
            return String.fromCodePoint.apply(String, n([], r(t2), false));
          }, e.isPercent = function(t2) {
            return !!t2.match(/%\s*$/);
          }, e.split = function(t2) {
            return t2.trim().split(/\s+/);
          };
        }, 8671: function(t, e, r) {
          r.r(e);
          var n = r(9515), o = r(3282), i = r(4907), a = r(7062), s = r(1168), l = r(315), c = r(5020), u = r(2560), p = r(1248);
          MathJax.loader && MathJax.loader.checkVersion("adaptors/liteDOM", o.VERSION, "adaptors"), (0, n.combineWithMathJax)({ _: { adaptors: { liteAdaptor: i, lite: { Document: a, Element: s, List: l, Parser: c, Text: u, Window: p } } } }), MathJax.startup && (MathJax.startup.registerConstructor("liteAdaptor", i.liteAdaptor), MathJax.startup.useAdaptor("liteAdaptor", true));
        }, 7187: function(t, e, r) {
          r.r(e);
          var n = r(9515), o = r(3282), i = r(444), a = r(6191), s = r(5009), l = r(3494), c = r(3670), u = r(805), p = r(9206), f = r(5722), h = r(4474), d = r(9e3), y = r(91), O = r(6336), m = r(1759), v = r(3909), M = r(9007), b = r(3948), E = r(9145), g = r(142), L = r(7590), x = r(3233), N = r(1334), _ = r(6661), T = r(1581), R = r(5410), A = r(6850), S = r(3985), C = r(450), w = r(6405), I = r(3050), P = r(2756), j = r(7238), D = r(5741), k = r(6145), B = r(9878), X = r(7265), F = r(6030), H = r(7131), J = r(1314), W = r(4461), q = r(1349), G = r(4359), z = r(4770), V = r(5022), U = r(5184), K = r(9102), $ = r(6325), Y = r(4082), Q = r(9259), Z = r(2975), tt = r(4574), et = r(4596), rt = r(7860), nt = r(8823), ot = r(8912), it = r(3811), at = r(6272), st = r(3683), lt = r(5138), ct = r(3726), ut = r(3363), pt = r(3335), ft = r(5713), ht = r(9923), dt = r(6469), yt = r(6751), Ot = r(5368), mt = r(7525), vt = r(103), Mt = r(7233), bt = r(8666), Et = r(4542), gt = r(4139), Lt = r(8054), xt = r(6010), Nt = r(7875), _t = r(505);
          MathJax.loader && MathJax.loader.checkVersion("core", o.VERSION, "core"), (0, n.combineWithMathJax)({ _: { adaptors: { HTMLAdaptor: i, browserAdaptor: a }, components: { global: n }, core: { DOMAdaptor: s, FindMath: l, Handler: c, HandlerList: u, InputJax: p, MathDocument: f, MathItem: h, MathList: d, MmlTree: { Attributes: y, MML: O, MathMLVisitor: m, MmlFactory: v, MmlNode: M, MmlNodes: { TeXAtom: b, maction: E, maligngroup: g, malignmark: L, math: x, mathchoice: N, menclose: _, merror: T, mfenced: R, mfrac: A, mglyph: S, mi: C, mmultiscripts: w, mn: I, mo: P, mpadded: j, mphantom: D, mroot: k, mrow: B, ms: X, mspace: F, msqrt: H, mstyle: J, msubsup: W, mtable: q, mtd: G, mtext: z, mtr: V, munderover: U, semantics: K }, MmlVisitor: $, OperatorDictionary: Y, SerializedMmlVisitor: Q }, OutputJax: Z, Tree: { Factory: tt, Node: et, NodeFactory: rt, Visitor: nt, Wrapper: ot, WrapperFactory: it } }, handlers: { html_ts: at, html: { HTMLDocument: st, HTMLDomStrings: lt, HTMLHandler: ct, HTMLMathItem: ut, HTMLMathList: pt } }, mathjax: ft, util: { AsyncLoad: ht, BBox: dt, BitField: yt, Entities: Ot, FunctionList: mt, LinkedList: vt, Options: Mt, PrioritizedList: bt, Retries: Et, StyleList: gt, Styles: Lt, lengths: xt, numeric: Nt, string: _t } } }), MathJax.startup && (MathJax.startup.registerConstructor("HTMLHandler", ct.HTMLHandler), MathJax.startup.registerConstructor("browserAdaptor", a.browserAdaptor), MathJax.startup.useHandler("HTMLHandler"), MathJax.startup.useAdaptor("browserAdaptor")), MathJax.loader && (MathJax._.mathjax.mathjax.asyncLoad = function(t2) {
            return MathJax.loader.load(t2);
          });
        }, 3226: function(t, e, r) {
          r.d(e, { q: function() {
            return o;
          } });
          var n = "/", o = { core: "".concat(n, "/core/core.js"), "adaptors/liteDOM": "".concat(n, "/adaptors/liteDOM/liteDOM.js"), "input/tex": "".concat(n, "/input/tex/tex.js"), "input/tex-base": "".concat(n, "/input/tex-base/tex-base.js"), "input/tex-full": "".concat(n, "/input/tex-full/tex-full.js"), "[tex]/action": "".concat(n, "/input/tex/extensions/action/action.js"), "[tex]/all-packages": "".concat(n, "/input/tex/extensions/all-packages/all-packages.js"), "[tex]/autoload": "".concat(n, "/input/tex/extensions/autoload/autoload.js"), "[tex]/ams": "".concat(n, "/input/tex/extensions/ams/ams.js"), "[tex]/amscd": "".concat(n, "/input/tex/extensions/amscd/amscd.js"), "[tex]/bbox": "".concat(n, "/input/tex/extensions/bbox/bbox.js"), "[tex]/boldsymbol": "".concat(n, "/input/tex/extensions/boldsymbol/boldsymbol.js"), "[tex]/braket": "".concat(n, "/input/tex/extensions/braket/braket.js"), "[tex]/bussproofs": "".concat(n, "/input/tex/extensions/bussproofs/bussproofs.js"), "[tex]/cancel": "".concat(n, "/input/tex/extensions/cancel/cancel.js"), "[tex]/centernot": "".concat(n, "/input/tex/extensions/centernot/centernot.js"), "[tex]/color": "".concat(n, "/input/tex/extensions/color/color.js"), "[tex]/colorv2": "".concat(n, "/input/tex/extensions/colorv2/colorv2.js"), "[tex]/configmacros": "".concat(n, "/input/tex/extensions/configmacros/configmacros.js"), "[tex]/enclose": "".concat(n, "/input/tex/extensions/enclose/enclose.js"), "[tex]/extpfeil": "".concat(n, "/input/tex/extensions/extpfeil/extpfeil.js"), "[tex]/html": "".concat(n, "/input/tex/extensions/html/html.js"), "[tex]/mathtools": "".concat(n, "/input/tex/extensions/mathtools/mathtools.js"), "[tex]/mhchem": "".concat(n, "/input/tex/extensions/mhchem/mhchem.js"), "[tex]/newcommand": "".concat(n, "/input/tex/extensions/newcommand/newcommand.js"), "[tex]/noerrors": "".concat(n, "/input/tex/extensions/noerrors/noerrors.js"), "[tex]/noundefined": "".concat(n, "/input/tex/extensions/noundefined/noundefined.js"), "[tex]/physics": "".concat(n, "/input/tex/extensions/physics/physics.js"), "[tex]/require": "".concat(n, "/input/tex/extensions/require/require.js"), "[tex]/setoptions": "".concat(n, "/input/tex/extensions/setoptions/setoptions.js"), "[tex]/tagformat": "".concat(n, "/input/tex/extensions/tagformat/tagformat.js"), "[tex]/textmacros": "".concat(n, "/input/tex/extensions/textmacros/textmacros.js"), "[tex]/unicode": "".concat(n, "/input/tex/extensions/unicode/unicode.js"), "[tex]/verb": "".concat(n, "/input/tex/extensions/verb/verb.js"), "[tex]/cases": "".concat(n, "/input/tex/extensions/cases/cases.js"), "[tex]/empheq": "".concat(n, "/input/tex/extensions/empheq/empheq.js"), "input/mml": "".concat(n, "/input/mml/mml.js"), "input/mml/entities": "".concat(n, "/input/mml/entities/entities.js"), "[mml]/mml3": "".concat(n, "/input/mml/extensions/mml3/mml3.js"), "input/asciimath": "".concat(n, "/input/asciimath/asciimath.js"), "output/chtml": "".concat(n, "/output/chtml/chtml.js"), "output/chtml/fonts/tex": "".concat(n, "/output/chtml/fonts/tex/tex.js"), "output/svg": "".concat(n, "/output/svg/svg.js"), "output/svg/fonts/tex": "".concat(n, "/output/svg/fonts/tex/tex.js"), "a11y/assistive-mml": "".concat(n, "/a11y/assistive-mml/assistive-mml.js"), "a11y/semantic-enrich": "".concat(n, "/a11y/semantic-enrich/semantic-enrich.js"), "a11y/complexity": "".concat(n, "/a11y/complexity/complexity.js"), "a11y/explorer": "".concat(n, "/a11y/explorer/explorer.js"), "a11y/sre": "".concat(n, "/a11y/sre/sre.js"), "ui/lazy": "".concat(n, "/ui/lazy/lazy.js"), "ui/menu": "".concat(n, "/ui/menu/menu.js"), "ui/safe": "".concat(n, "/ui/safe/safe.js"), "mml-chtml": "".concat(n, "/mml-chtml/mml-chtml.js"), "mml-svg": "".concat(n, "/mml-svg/mml-svg.js"), "tex-chtml": "".concat(n, "/tex-chtml/tex-chtml.js"), "tex-svg": "".concat(n, "/tex-svg/tex-svg.js"), "tex-mml-chtml": "".concat(n, "/tex-mml-chtml/tex-mml-chtml.js"), "tex-mml-svg": "".concat(n, "/tex-mml-svg/tex-mml-svg.js"), loader: "".concat(n, "/loader/loader.js"), startup: "".concat(n, "/startup/startup.js") };
        }, 1585: function(t, e, r) {
          r.r(e);
          var n = r(9515), o = r(3282), i = r(235), a = r(265), s = r(2388);
          function l(t2, e2) {
            (null == e2 || e2 > t2.length) && (e2 = t2.length);
            for (var r2 = 0, n2 = new Array(e2); r2 < e2; r2++) n2[r2] = t2[r2];
            return n2;
          }
          MathJax.loader && MathJax.loader.checkVersion("startup", o.VERSION, "startup"), (0, n.combineWithMathJax)({ _: { components: { loader: i, package: a, startup: s } } });
          var c, u = { "a11y/semantic-enrich": ["input/mml", "a11y/sre"], "a11y/complexity": ["a11y/semantic-enrich"], "a11y/explorer": ["a11y/semantic-enrich", "ui/menu"], "[mml]/mml3": ["input/mml"], "[tex]/all-packages": ["input/tex-base"], "[tex]/action": ["input/tex-base", "[tex]/newcommand"], "[tex]/autoload": ["input/tex-base", "[tex]/require"], "[tex]/ams": ["input/tex-base"], "[tex]/amscd": ["input/tex-base"], "[tex]/bbox": ["input/tex-base", "[tex]/ams", "[tex]/newcommand"], "[tex]/boldsymbol": ["input/tex-base"], "[tex]/braket": ["input/tex-base"], "[tex]/bussproofs": ["input/tex-base"], "[tex]/cancel": ["input/tex-base", "[tex]/enclose"], "[tex]/centernot": ["input/tex-base"], "[tex]/color": ["input/tex-base"], "[tex]/colorv2": ["input/tex-base"], "[tex]/colortbl": ["input/tex-base", "[tex]/color"], "[tex]/configmacros": ["input/tex-base", "[tex]/newcommand"], "[tex]/enclose": ["input/tex-base"], "[tex]/extpfeil": ["input/tex-base", "[tex]/newcommand", "[tex]/ams"], "[tex]/html": ["input/tex-base"], "[tex]/mathtools": ["input/tex-base", "[tex]/newcommand", "[tex]/ams"], "[tex]/mhchem": ["input/tex-base", "[tex]/ams"], "[tex]/newcommand": ["input/tex-base"], "[tex]/noerrors": ["input/tex-base"], "[tex]/noundefined": ["input/tex-base"], "[tex]/physics": ["input/tex-base"], "[tex]/require": ["input/tex-base"], "[tex]/setoptions": ["input/tex-base"], "[tex]/tagformat": ["input/tex-base"], "[tex]/textcomp": ["input/tex-base", "[tex]/textmacros"], "[tex]/textmacros": ["input/tex-base"], "[tex]/unicode": ["input/tex-base"], "[tex]/verb": ["input/tex-base"], "[tex]/cases": ["[tex]/empheq"], "[tex]/empheq": ["input/tex-base", "[tex]/ams"] }, p = Array.from(Object.keys(u)).filter((function(t2) {
            return "[tex]" === t2.substr(0, 5) && "[tex]/autoload" !== t2 && "[tex]/colorv2" !== t2 && "[tex]/all-packages" !== t2;
          })), f = { startup: ["loader"], "input/tex": ["input/tex-base", "[tex]/ams", "[tex]/newcommand", "[tex]/noundefined", "[tex]/require", "[tex]/autoload", "[tex]/configmacros"], "input/tex-full": ["input/tex-base", "[tex]/all-packages"].concat((c = p, (function(t2) {
            if (Array.isArray(t2)) return l(t2);
          })(c) || (function(t2) {
            if ("undefined" != typeof Symbol && null != t2[Symbol.iterator] || null != t2["@@iterator"]) return Array.from(t2);
          })(c) || (function(t2, e2) {
            if (t2) {
              if ("string" == typeof t2) return l(t2, e2);
              var r2 = Object.prototype.toString.call(t2).slice(8, -1);
              return "Object" === r2 && t2.constructor && (r2 = t2.constructor.name), "Map" === r2 || "Set" === r2 ? Array.from(t2) : "Arguments" === r2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r2) ? l(t2, e2) : void 0;
            }
          })(c) || (function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          })())), "[tex]/all-packages": p };
          (0, n.combineDefaults)(MathJax.config.loader, "dependencies", u), (0, n.combineDefaults)(MathJax.config.loader, "paths", { tex: "[mathjax]/input/tex/extensions", mml: "[mathjax]/input/mml/extensions", sre: "[mathjax]/sre/mathmaps" }), (0, n.combineDefaults)(MathJax.config.loader, "provides", f), (0, n.combineDefaults)(MathJax.config.loader, "source", { "[tex]/amsCd": "[tex]/amscd", "[tex]/colorV2": "[tex]/colorv2", "[tex]/configMacros": "[tex]/configmacros", "[tex]/tagFormat": "[tex]/tagformat" });
        } }, __webpack_module_cache__ = {};
        function __webpack_require__(t) {
          var e = __webpack_module_cache__[t];
          if (void 0 !== e) return e.exports;
          var r = __webpack_module_cache__[t] = { exports: {} };
          return __webpack_modules__[t].call(r.exports, r, r.exports, __webpack_require__), r.exports;
        }
        __webpack_require__.d = function(t, e) {
          for (var r in e) __webpack_require__.o(e, r) && !__webpack_require__.o(t, r) && Object.defineProperty(t, r, { enumerable: true, get: e[r] });
        }, __webpack_require__.g = (function() {
          if ("object" == typeof globalThis) return globalThis;
          try {
            return this || new Function("return this")();
          } catch (t) {
            if ("object" == typeof window) return window;
          }
        })(), __webpack_require__.o = function(t, e) {
          return Object.prototype.hasOwnProperty.call(t, e);
        }, __webpack_require__.r = function(t) {
          "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t, "__esModule", { value: true });
        };
        var __webpack_exports__ = {};
        !(function() {
          function _toConsumableArray(t) {
            return _arrayWithoutHoles(t) || _iterableToArray(t) || _unsupportedIterableToArray(t) || _nonIterableSpread();
          }
          function _nonIterableSpread() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }
          function _unsupportedIterableToArray(t, e) {
            if (t) {
              if ("string" == typeof t) return _arrayLikeToArray(t, e);
              var r = Object.prototype.toString.call(t).slice(8, -1);
              return "Object" === r && t.constructor && (r = t.constructor.name), "Map" === r || "Set" === r ? Array.from(t) : "Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? _arrayLikeToArray(t, e) : void 0;
            }
          }
          function _iterableToArray(t) {
            if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"]) return Array.from(t);
          }
          function _arrayWithoutHoles(t) {
            if (Array.isArray(t)) return _arrayLikeToArray(t);
          }
          function _arrayLikeToArray(t, e) {
            (null == e || e > t.length) && (e = t.length);
            for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
            return n;
          }
          __webpack_require__.d(__webpack_exports__, { init: function() {
            return init;
          } });
          var path = eval("require('path')");
          __webpack_require__(1585);
          var _require = __webpack_require__(235), Loader = _require.Loader, CONFIG = _require.CONFIG, _require2 = __webpack_require__(9515), combineDefaults = _require2.combineDefaults, combineConfig = _require2.combineConfig;
          combineDefaults(MathJax.config, "loader", { require: eval("require"), failed: function(t) {
            throw t;
          } }), Loader.preLoad("loader", "startup", "core", "adaptors/liteDOM"), __webpack_require__(7187), __webpack_require__(8671);
          var dir = CONFIG.paths.mathjax = eval("__dirname");
          if ("node-main" === path.basename(dir)) {
            CONFIG.paths.mathjax = path.dirname(dir), combineDefaults(CONFIG, "source", __webpack_require__(3226).q);
            var ROOT = path.resolve(dir, "../../../js"), REQUIRE = MathJax.config.loader.require;
            MathJax._.mathjax.mathjax.asyncLoad = function(t) {
              return REQUIRE("." === t.charAt(0) ? path.resolve(ROOT, t) : t);
            };
          }
          var init = function() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            return combineConfig(MathJax.config, t), Loader.load.apply(Loader, _toConsumableArray(CONFIG.load)).then((function() {
              return CONFIG.ready();
            })).then((function() {
              return MathJax;
            })).catch((function(t2) {
              return CONFIG.failed(t2);
            }));
          };
        })(), exports.init = __webpack_exports__.init;
      })();
    }
  });

  // node_modules/mathjax-svg-filter/mathjax-svg-filter.js
  var pandoc = require_pandoc_filter();
  var { DOMParser, XMLSerializer } = require_lib();
  var mj = null;
  function wrap(display, s) {
    return pandoc.Span(["", [display ? "display-math" : "inline-math"], []], s);
  }
  async function action({ t: type, c: content }, _format, meta) {
    if (mj === null) {
      mj = require_node_main().init({
        loader: { load: ["input/tex", "output/svg"] },
        enableAssistiveMml: true,
        SVG: {
          font: meta["mathjax-svg-font"] || "TeX",
          minScaleAdjust: 75,
          scale: 100,
          matchFontHeight: true
        }
      });
    }
    if (type == "Math") {
      const tex = content[1];
      const display = content[0].t == "DisplayMath";
      const result = await mj.then((MathJax2) => {
        const svg = MathJax2.tex2svg(tex, { display });
        return MathJax2.startup.adaptor.innerHTML(svg);
      }).catch((err) => console.log(err.message));
      const doc = new DOMParser().parseFromString(result, "text/xml");
      let title = doc.getElementsByTagName("title")[0];
      if (!title) {
        title = doc.createElement("title");
        doc.documentElement.insertBefore(title, doc.documentElement.firstChild);
        title.textContent = tex;
      }
      const paths = doc.getElementsByTagName("path");
      for (let i = 0; i < paths.length; i++) {
        const path2 = paths[i];
        const dAttr = path2.getAttribute("d");
        if (dAttr === "" || dAttr === null) {
          path2.setAttribute("d", " ");
        }
      }
      return wrap(display, [pandoc.RawInline("html", new XMLSerializer().serializeToString(doc))]);
    }
  }
  pandoc.stdio(action);
})();
/*! Bundled license information:

pandoc-filter/index.js:
  (*! pandoc-filter-node | (C) 2014 Mike Henderson <mvhenderson@tds.net> | License: MIT *)
*/
