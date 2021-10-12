'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var melodyTypes = require('melody-types');
var melodyParser = require('melody-parser');
var _filter = _interopDefault(require('lodash/filter'));
var melodyTraverse = require('melody-traverse');
var t = require('babel-types');
var babelTemplate = _interopDefault(require('babel-template'));

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var unaryOperators = [];
var binaryOperators = [];
var tests = [];

//region Unary Expressions
var UnaryNotExpression = createUnaryOperator('not', 'UnaryNotExpression', 50);
var UnaryNeqExpression = createUnaryOperator('-', 'UnaryNeqExpression', 500);
var UnaryPosExpression = createUnaryOperator('+', 'UnaryPosExpression', 500);
//endregion

//region Binary Expressions
var BinaryOrExpression = createBinaryOperatorNode({
    text: 'or',
    type: 'BinaryOrExpression',
    precedence: 10,
    associativity: melodyParser.LEFT
});
var BinaryAndExpression = createBinaryOperatorNode({
    text: 'and',
    type: 'BinaryAndExpression',
    precedence: 15,
    associativity: melodyParser.LEFT
});

var BitwiseOrExpression = createBinaryOperatorNode({
    text: 'b-or',
    type: 'BitwiseOrExpression',
    precedence: 16,
    associativity: melodyParser.LEFT
});
var BitwiseXorExpression = createBinaryOperatorNode({
    text: 'b-xor',
    type: 'BitwiseXOrExpression',
    precedence: 17,
    associativity: melodyParser.LEFT
});
var BitwiseAndExpression = createBinaryOperatorNode({
    text: 'b-and',
    type: 'BitwiseAndExpression',
    precedence: 18,
    associativity: melodyParser.LEFT
});

var BinaryEqualsExpression = createBinaryOperatorNode({
    text: '==',
    type: 'BinaryEqualsExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryNotEqualsExpression = createBinaryOperatorNode({
    text: '!=',
    type: 'BinaryNotEqualsExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryLessThanExpression = createBinaryOperatorNode({
    text: '<',
    type: 'BinaryLessThanExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryGreaterThanExpression = createBinaryOperatorNode({
    text: '>',
    type: 'BinaryGreaterThanExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryLessThanOrEqualExpression = createBinaryOperatorNode({
    text: '<=',
    type: 'BinaryLessThanOrEqualExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryGreaterThanOrEqualExpression = createBinaryOperatorNode({
    text: '>=',
    type: 'BinaryGreaterThanOrEqualExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});

var BinaryNotInExpression = createBinaryOperatorNode({
    text: 'not in',
    type: 'BinaryNotInExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryInExpression = createBinaryOperatorNode({
    text: 'in',
    type: 'BinaryInExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryMatchesExpression = createBinaryOperatorNode({
    text: 'matches',
    type: 'BinaryMatchesExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryStartsWithExpression = createBinaryOperatorNode({
    text: 'starts with',
    type: 'BinaryStartsWithExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});
var BinaryEndsWithExpression = createBinaryOperatorNode({
    text: 'ends with',
    type: 'BinaryEndsWithExpression',
    precedence: 20,
    associativity: melodyParser.LEFT
});

var BinaryRangeExpression = createBinaryOperatorNode({
    text: '..',
    type: 'BinaryRangeExpression',
    precedence: 25,
    associativity: melodyParser.LEFT
});

var BinaryAddExpression = createBinaryOperatorNode({
    text: '+',
    type: 'BinaryAddExpression',
    precedence: 30,
    associativity: melodyParser.LEFT
});
var BinarySubExpression = createBinaryOperatorNode({
    text: '-',
    type: 'BinarySubExpression',
    precedence: 30,
    associativity: melodyParser.LEFT
});
binaryOperators.push({
    text: '~',
    precedence: 40,
    associativity: melodyParser.LEFT,
    createNode: function createNode(token, lhs, rhs) {
        var op = new melodyTypes.BinaryConcatExpression(lhs, rhs);
        melodyParser.copyStart(op, lhs);
        melodyParser.copyEnd(op, rhs);
        return op;
    }
});
var BinaryMulExpression = createBinaryOperatorNode({
    text: '*',
    type: 'BinaryMulExpression',
    precedence: 60,
    associativity: melodyParser.LEFT
});
var BinaryDivExpression = createBinaryOperatorNode({
    text: '/',
    type: 'BinaryDivExpression',
    precedence: 60,
    associativity: melodyParser.LEFT
});
var BinaryFloorDivExpression = createBinaryOperatorNode({
    text: '//',
    type: 'BinaryFloorDivExpression',
    precedence: 60,
    associativity: melodyParser.LEFT
});
var BinaryModExpression = createBinaryOperatorNode({
    text: '%',
    type: 'BinaryModExpression',
    precedence: 60,
    associativity: melodyParser.LEFT
});

binaryOperators.push({
    text: 'is',
    precedence: 100,
    associativity: melodyParser.LEFT,
    parse: function parse(parser, token, expr) {
        var tokens = parser.tokens;

        var not = false;
        if (tokens.nextIf(melodyParser.Types.OPERATOR, 'not')) {
            not = true;
        }

        var test = getTest(parser);
        var args = null;
        if (tokens.test(melodyParser.Types.LPAREN)) {
            args = parser.matchArguments();
        }
        var testExpression = test.createNode(expr, args);
        melodyParser.setStartFromToken(testExpression, token);
        melodyParser.setEndFromToken(testExpression, tokens.la(-1));
        if (not) {
            return melodyParser.copyLoc(new UnaryNotExpression(testExpression), testExpression);
        }
        return testExpression;
    }
});

function getTest(parser) {
    var tokens = parser.tokens;
    var nameToken = tokens.la(0);
    if (nameToken.type !== melodyParser.Types.NULL) {
        tokens.expect(melodyParser.Types.SYMBOL);
    } else {
        tokens.next();
    }
    var testName = nameToken.text;
    if (!parser.hasTest(testName)) {
        // try 2-words tests
        var continuedNameToken = tokens.expect(melodyParser.Types.SYMBOL);
        testName += ' ' + continuedNameToken.text;
        if (!parser.hasTest(testName)) {
            parser.error({
                title: 'Unknown test "' + testName + '"',
                pos: nameToken.pos
            });
        }
    }

    return parser.getTest(testName);
}

var BinaryPowerExpression = createBinaryOperatorNode({
    text: '**',
    type: 'BinaryPowerExpression',
    precedence: 200,
    associativity: melodyParser.LEFT
});
var BinaryNullCoalesceExpression = createBinaryOperatorNode({
    text: '??',
    type: 'BinaryNullCoalesceExpression',
    precedence: 300,
    associativity: melodyParser.LEFT
});
//endregion

//region Test Expressions
var TestEvenExpression = createTest('even', 'TestEvenExpression');
var TestOddExpression = createTest('odd', 'TestOddExpression');
var TestDefinedExpression = createTest('defined', 'TestDefinedExpression');
var TestSameAsExpression = createTest('same as', 'TestSameAsExpression');
tests.push({
    text: 'sameas',
    createNode: function createNode(expr, args) {
        // todo: add deprecation warning
        return new TestSameAsExpression(expr, args);
    }
});
var TestNullExpression = createTest('null', 'TestNullExpression');
tests.push({
    text: 'none',
    createNode: function createNode(expr, args) {
        return new TestNullExpression(expr, args);
    }
});
var TestDivisibleByExpression = createTest('divisible by', 'TestDivisibleByExpression');
tests.push({
    text: 'divisibleby',
    createNode: function createNode(expr, args) {
        // todo: add deprecation warning
        return new TestDivisibleByExpression(expr, args);
    }
});
var TestConstantExpression = createTest('constant', 'TestConstantExpression');
var TestEmptyExpression = createTest('empty', 'TestEmptyExpression');
var TestIterableExpression = createTest('iterable', 'TestIterableExpression');
//endregion

//region Utilities
function createTest(text, typeName) {
    var TestExpression = function (_Node) {
        inherits(TestExpression, _Node);

        function TestExpression(expr, args) {
            classCallCheck(this, TestExpression);

            var _this = possibleConstructorReturn(this, _Node.call(this));

            _this.expression = expr;
            _this.arguments = args;
            return _this;
        }

        return TestExpression;
    }(melodyTypes.Node);
    melodyTypes.type(TestExpression, typeName);
    melodyTypes.alias(TestExpression, 'Expression', 'TestExpression');
    melodyTypes.visitor(TestExpression, 'expression', 'arguments');

    tests.push({
        text: text,
        createNode: function createNode(expr, args) {
            return new TestExpression(expr, args);
        }
    });

    return TestExpression;
}

function createBinaryOperatorNode(options) {
    var text = options.text,
        precedence = options.precedence,
        associativity = options.associativity;

    var BinarySubclass = function (_BinaryExpression) {
        inherits(BinarySubclass, _BinaryExpression);

        function BinarySubclass(left, right) {
            classCallCheck(this, BinarySubclass);
            return possibleConstructorReturn(this, _BinaryExpression.call(this, text, left, right));
        }

        return BinarySubclass;
    }(melodyTypes.BinaryExpression);
    melodyTypes.type(BinarySubclass, options.type);
    melodyTypes.alias(BinarySubclass, 'BinaryExpression', 'Binary', 'Expression');
    melodyTypes.visitor(BinarySubclass, 'left', 'right');

    var operator = {
        text: text,
        precedence: precedence,
        associativity: associativity
    };
    if (options.parse) {
        operator.parse = options.parse;
    } else if (options.createNode) {
        operator.createNode = options.createNode;
    } else {
        operator.createNode = function (token, lhs, rhs) {
            return new BinarySubclass(lhs, rhs);
        };
    }
    binaryOperators.push(operator);

    return BinarySubclass;
}

function createUnaryOperator(operator, typeName, precedence) {
    var UnarySubclass = function (_UnaryExpression) {
        inherits(UnarySubclass, _UnaryExpression);

        function UnarySubclass(argument) {
            classCallCheck(this, UnarySubclass);
            return possibleConstructorReturn(this, _UnaryExpression.call(this, operator, argument));
        }

        return UnarySubclass;
    }(melodyTypes.UnaryExpression);
    melodyTypes.type(UnarySubclass, typeName);
    melodyTypes.alias(UnarySubclass, 'Expression', 'UnaryLike');
    melodyTypes.visitor(UnarySubclass, 'argument');

    unaryOperators.push({
        text: operator,
        precedence: precedence,
        createNode: function createNode(token, expr) {
            var op = new UnarySubclass(expr);
            melodyParser.setStartFromToken(op, token);
            melodyParser.copyEnd(op, expr);
            return op;
        }
    });

    return UnarySubclass;
}

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var AutoescapeBlock = function (_Node) {
    inherits(AutoescapeBlock, _Node);

    function AutoescapeBlock(type, expressions) {
        classCallCheck(this, AutoescapeBlock);

        var _this = possibleConstructorReturn(this, _Node.call(this));

        _this.escapeType = type;
        _this.expressions = expressions;
        return _this;
    }

    return AutoescapeBlock;
}(melodyTypes.Node);
melodyTypes.type(AutoescapeBlock, 'AutoescapeBlock');
melodyTypes.alias(AutoescapeBlock, 'Block', 'Escape');
melodyTypes.visitor(AutoescapeBlock, 'expressions');

var BlockStatement = function (_Node2) {
    inherits(BlockStatement, _Node2);

    function BlockStatement(name, body) {
        classCallCheck(this, BlockStatement);

        var _this2 = possibleConstructorReturn(this, _Node2.call(this));

        _this2.name = name;
        _this2.body = body;
        return _this2;
    }

    return BlockStatement;
}(melodyTypes.Node);
melodyTypes.type(BlockStatement, 'BlockStatement');
melodyTypes.alias(BlockStatement, 'Statement', 'Scope', 'RootScope');
melodyTypes.visitor(BlockStatement, 'body');

var BlockCallExpression = function (_Node3) {
    inherits(BlockCallExpression, _Node3);

    function BlockCallExpression(callee) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        classCallCheck(this, BlockCallExpression);

        var _this3 = possibleConstructorReturn(this, _Node3.call(this));

        _this3.callee = callee;
        _this3.arguments = args;
        return _this3;
    }

    return BlockCallExpression;
}(melodyTypes.Node);
melodyTypes.type(BlockCallExpression, 'BlockCallExpression');
melodyTypes.alias(BlockCallExpression, 'Expression', 'FunctionInvocation');
melodyTypes.visitor(BlockCallExpression, 'arguments');

var MountStatement = function (_Node4) {
    inherits(MountStatement, _Node4);

    function MountStatement(name, source, key, argument, async, delayBy) {
        classCallCheck(this, MountStatement);

        var _this4 = possibleConstructorReturn(this, _Node4.call(this));

        _this4.name = name;
        _this4.source = source;
        _this4.key = key;
        _this4.argument = argument;
        _this4.async = async;
        _this4.delayBy = delayBy;
        _this4.errorVariableName = null;
        _this4.body = null;
        _this4.otherwise = null;
        return _this4;
    }

    return MountStatement;
}(melodyTypes.Node);
melodyTypes.type(MountStatement, 'MountStatement');
melodyTypes.alias(MountStatement, 'Statement', 'Scope');
melodyTypes.visitor(MountStatement, 'name', 'source', 'key', 'argument', 'body', 'otherwise');

var DoStatement = function (_Node5) {
    inherits(DoStatement, _Node5);

    function DoStatement(expression) {
        classCallCheck(this, DoStatement);

        var _this5 = possibleConstructorReturn(this, _Node5.call(this));

        _this5.value = expression;
        return _this5;
    }

    return DoStatement;
}(melodyTypes.Node);
melodyTypes.type(DoStatement, 'DoStatement');
melodyTypes.alias(DoStatement, 'Statement');
melodyTypes.visitor(DoStatement, 'value');

var EmbedStatement = function (_Node6) {
    inherits(EmbedStatement, _Node6);

    function EmbedStatement(parent) {
        classCallCheck(this, EmbedStatement);

        var _this6 = possibleConstructorReturn(this, _Node6.call(this));

        _this6.parent = parent;
        _this6.argument = null;
        _this6.contextFree = false;
        // when `true`, missing templates will be ignored
        _this6.ignoreMissing = false;
        _this6.blocks = null;
        return _this6;
    }

    return EmbedStatement;
}(melodyTypes.Node);
melodyTypes.type(EmbedStatement, 'EmbedStatement');
melodyTypes.alias(EmbedStatement, 'Statement', 'Include');
melodyTypes.visitor(EmbedStatement, 'argument', 'blocks');

var ExtendsStatement = function (_Node7) {
    inherits(ExtendsStatement, _Node7);

    function ExtendsStatement(parentName) {
        classCallCheck(this, ExtendsStatement);

        var _this7 = possibleConstructorReturn(this, _Node7.call(this));

        _this7.parentName = parentName;
        return _this7;
    }

    return ExtendsStatement;
}(melodyTypes.Node);
melodyTypes.type(ExtendsStatement, 'ExtendsStatement');
melodyTypes.alias(ExtendsStatement, 'Statement', 'Include');
melodyTypes.visitor(ExtendsStatement, 'parentName');

var FilterBlockStatement = function (_Node8) {
    inherits(FilterBlockStatement, _Node8);

    function FilterBlockStatement(filterExpression, body) {
        classCallCheck(this, FilterBlockStatement);

        var _this8 = possibleConstructorReturn(this, _Node8.call(this));

        _this8.filterExpression = filterExpression;
        _this8.body = body;
        return _this8;
    }

    return FilterBlockStatement;
}(melodyTypes.Node);
melodyTypes.type(FilterBlockStatement, 'FilterBlockStatement');
melodyTypes.alias(FilterBlockStatement, 'Statement', 'Block');
melodyTypes.visitor(FilterBlockStatement, 'filterExpression', 'body');

var FlushStatement = function (_Node9) {
    inherits(FlushStatement, _Node9);

    function FlushStatement() {
        classCallCheck(this, FlushStatement);
        return possibleConstructorReturn(this, _Node9.call(this));
    }

    return FlushStatement;
}(melodyTypes.Node);
melodyTypes.type(FlushStatement, 'FlushStatement');
melodyTypes.alias(FlushStatement, 'Statement');

var ForStatement = function (_Node10) {
    inherits(ForStatement, _Node10);

    function ForStatement() {
        var keyTarget = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var valueTarget = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var sequence = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var condition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var body = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        var otherwise = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
        classCallCheck(this, ForStatement);

        var _this10 = possibleConstructorReturn(this, _Node10.call(this));

        _this10.keyTarget = keyTarget;
        _this10.valueTarget = valueTarget;
        _this10.sequence = sequence;
        _this10.condition = condition;
        _this10.body = body;
        _this10.otherwise = otherwise;
        return _this10;
    }

    return ForStatement;
}(melodyTypes.Node);
melodyTypes.type(ForStatement, 'ForStatement');
melodyTypes.alias(ForStatement, 'Statement', 'Scope', 'Loop');
melodyTypes.visitor(ForStatement, 'keyTarget', 'valueTarget', 'sequence', 'condition', 'body', 'otherwise');

var ImportDeclaration = function (_Node11) {
    inherits(ImportDeclaration, _Node11);

    function ImportDeclaration(key, alias) {
        classCallCheck(this, ImportDeclaration);

        var _this11 = possibleConstructorReturn(this, _Node11.call(this));

        _this11.key = key;
        _this11.alias = alias;
        return _this11;
    }

    return ImportDeclaration;
}(melodyTypes.Node);
melodyTypes.type(ImportDeclaration, 'ImportDeclaration');
melodyTypes.alias(ImportDeclaration, 'VariableDeclaration');
melodyTypes.visitor(ImportDeclaration, 'key', 'value');

var FromStatement = function (_Node12) {
    inherits(FromStatement, _Node12);

    function FromStatement(source, imports) {
        classCallCheck(this, FromStatement);

        var _this12 = possibleConstructorReturn(this, _Node12.call(this));

        _this12.source = source;
        _this12.imports = imports;
        return _this12;
    }

    return FromStatement;
}(melodyTypes.Node);
melodyTypes.type(FromStatement, 'FromStatement');
melodyTypes.alias(FromStatement, 'Statement');
melodyTypes.visitor(FromStatement, 'source', 'imports');

var IfStatement = function (_Node13) {
    inherits(IfStatement, _Node13);

    function IfStatement(test) {
        var consequent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var alternate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        classCallCheck(this, IfStatement);

        var _this13 = possibleConstructorReturn(this, _Node13.call(this));

        _this13.test = test;
        _this13.consequent = consequent;
        _this13.alternate = alternate;
        return _this13;
    }

    return IfStatement;
}(melodyTypes.Node);
melodyTypes.type(IfStatement, 'IfStatement');
melodyTypes.alias(IfStatement, 'Statement', 'Conditional');
melodyTypes.visitor(IfStatement, 'test', 'consequent', 'alternate');

var IncludeStatement = function (_Node14) {
    inherits(IncludeStatement, _Node14);

    function IncludeStatement(source) {
        classCallCheck(this, IncludeStatement);

        var _this14 = possibleConstructorReturn(this, _Node14.call(this));

        _this14.source = source;
        _this14.argument = null;
        _this14.contextFree = false;
        // when `true`, missing templates will be ignored
        _this14.ignoreMissing = false;
        return _this14;
    }

    return IncludeStatement;
}(melodyTypes.Node);
melodyTypes.type(IncludeStatement, 'IncludeStatement');
melodyTypes.alias(IncludeStatement, 'Statement', 'Include');
melodyTypes.visitor(IncludeStatement, 'source', 'argument');

var MacroDeclarationStatement = function (_Node15) {
    inherits(MacroDeclarationStatement, _Node15);

    function MacroDeclarationStatement(name, args, body) {
        classCallCheck(this, MacroDeclarationStatement);

        var _this15 = possibleConstructorReturn(this, _Node15.call(this));

        _this15.name = name;
        _this15.arguments = args;
        _this15.body = body;
        return _this15;
    }

    return MacroDeclarationStatement;
}(melodyTypes.Node);
melodyTypes.type(MacroDeclarationStatement, 'MacroDeclarationStatement');
melodyTypes.alias(MacroDeclarationStatement, 'Statement', 'Scope', 'RootScope');
melodyTypes.visitor(MacroDeclarationStatement, 'name', 'arguments', 'body');

var VariableDeclarationStatement = function (_Node16) {
    inherits(VariableDeclarationStatement, _Node16);

    function VariableDeclarationStatement(name, value) {
        classCallCheck(this, VariableDeclarationStatement);

        var _this16 = possibleConstructorReturn(this, _Node16.call(this));

        _this16.name = name;
        _this16.value = value;
        return _this16;
    }

    return VariableDeclarationStatement;
}(melodyTypes.Node);
melodyTypes.type(VariableDeclarationStatement, 'VariableDeclarationStatement');
melodyTypes.alias(VariableDeclarationStatement, 'Statement');
melodyTypes.visitor(VariableDeclarationStatement, 'name', 'value');

var SetStatement = function (_Node17) {
    inherits(SetStatement, _Node17);

    function SetStatement(assignments) {
        classCallCheck(this, SetStatement);

        var _this17 = possibleConstructorReturn(this, _Node17.call(this));

        _this17.assignments = assignments;
        return _this17;
    }

    return SetStatement;
}(melodyTypes.Node);
melodyTypes.type(SetStatement, 'SetStatement');
melodyTypes.alias(SetStatement, 'Statement', 'ContextMutation');
melodyTypes.visitor(SetStatement, 'assignments');

var SpacelessBlock = function (_Node18) {
    inherits(SpacelessBlock, _Node18);

    function SpacelessBlock() {
        var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        classCallCheck(this, SpacelessBlock);

        var _this18 = possibleConstructorReturn(this, _Node18.call(this));

        _this18.body = body;
        return _this18;
    }

    return SpacelessBlock;
}(melodyTypes.Node);
melodyTypes.type(SpacelessBlock, 'SpacelessBlock');
melodyTypes.alias(SpacelessBlock, 'Statement', 'Block');
melodyTypes.visitor(SpacelessBlock, 'body');

var AliasExpression = function (_Node19) {
    inherits(AliasExpression, _Node19);

    function AliasExpression(name, alias) {
        classCallCheck(this, AliasExpression);

        var _this19 = possibleConstructorReturn(this, _Node19.call(this));

        _this19.name = name;
        _this19.alias = alias;
        return _this19;
    }

    return AliasExpression;
}(melodyTypes.Node);
melodyTypes.type(AliasExpression, 'AliasExpression');
melodyTypes.alias(AliasExpression, 'Expression');
melodyTypes.visitor(AliasExpression, 'name', 'alias');

var UseStatement = function (_Node20) {
    inherits(UseStatement, _Node20);

    function UseStatement(source, aliases) {
        classCallCheck(this, UseStatement);

        var _this20 = possibleConstructorReturn(this, _Node20.call(this));

        _this20.source = source;
        _this20.aliases = aliases;
        return _this20;
    }

    return UseStatement;
}(melodyTypes.Node);
melodyTypes.type(UseStatement, 'UseStatement');
melodyTypes.alias(UseStatement, 'Statement', 'Include');
melodyTypes.visitor(UseStatement, 'source', 'aliases');

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var AutoescapeParser = {
    name: 'autoescape',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        var escapeType = null,
            stringStartToken = void 0,
            openingTagEndToken = void 0,
            closingTagStartToken = void 0;
        if (tokens.nextIf(melodyParser.Types.TAG_END)) {
            openingTagEndToken = tokens.la(-1);
            escapeType = null;
        } else if (stringStartToken = tokens.nextIf(melodyParser.Types.STRING_START)) {
            escapeType = tokens.expect(melodyParser.Types.STRING).text;
            if (!tokens.nextIf(melodyParser.Types.STRING_END)) {
                parser.error({
                    title: 'autoescape type declaration must be a simple string',
                    pos: tokens.la(0).pos,
                    advice: 'The type declaration for autoescape must be a simple string such as \'html\' or \'js\'.\nI expected the current string to end with a ' + stringStartToken.text + ' but instead found ' + (melodyParser.Types.ERROR_TABLE[tokens.lat(0)] || tokens.lat(0)) + '.'
                });
            }
            openingTagEndToken = tokens.la(0);
        } else if (tokens.nextIf(melodyParser.Types.FALSE)) {
            escapeType = false;
            openingTagEndToken = tokens.la(0);
        } else if (tokens.nextIf(melodyParser.Types.TRUE)) {
            escapeType = true;
            openingTagEndToken = tokens.la(0);
        } else {
            parser.error({
                title: 'Invalid autoescape type declaration',
                pos: tokens.la(0).pos,
                advice: 'Expected type of autoescape to be a string, boolean or not specified. Found ' + tokens.la(0).type + ' instead.'
            });
        }

        var autoescape = new AutoescapeBlock(escapeType);
        melodyParser.setStartFromToken(autoescape, token);
        var tagEndToken = void 0;
        autoescape.expressions = parser.parse(function (_, token, tokens) {
            if (token.type === melodyParser.Types.TAG_START && tokens.nextIf(melodyParser.Types.SYMBOL, 'endautoescape')) {
                closingTagStartToken = token;
                tagEndToken = tokens.expect(melodyParser.Types.TAG_END);
                return true;
            }
            return false;
        }).expressions;
        melodyParser.setEndFromToken(autoescape, tagEndToken);

        autoescape.trimRightAutoescape = melodyParser.hasTagEndTokenTrimRight(openingTagEndToken);
        autoescape.trimLeftEndautoescape = melodyParser.hasTagStartTokenTrimLeft(closingTagStartToken);

        return autoescape;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var BlockParser = {
    name: 'block',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            nameToken = tokens.expect(melodyParser.Types.SYMBOL);

        var blockStatement = void 0,
            openingTagEndToken = void 0,
            closingTagStartToken = void 0;
        if (openingTagEndToken = tokens.nextIf(melodyParser.Types.TAG_END)) {
            blockStatement = new BlockStatement(melodyParser.createNode(melodyTypes.Identifier, nameToken, nameToken.text), parser.parse(function (tokenText, token, tokens) {
                var result = !!(token.type === melodyParser.Types.TAG_START && tokens.nextIf(melodyParser.Types.SYMBOL, 'endblock'));
                if (result) {
                    closingTagStartToken = token;
                }
                return result;
            }).expressions);

            if (tokens.nextIf(melodyParser.Types.SYMBOL, nameToken.text)) {
                if (tokens.lat(0) !== melodyParser.Types.TAG_END) {
                    var unexpectedToken = tokens.next();
                    parser.error({
                        title: 'Block name mismatch',
                        pos: unexpectedToken.pos,
                        advice: unexpectedToken.type == melodyParser.Types.SYMBOL ? 'Expected end of block ' + nameToken.text + ' but instead found end of block ' + tokens.la(0).text + '.' : 'endblock must be followed by either \'%}\' or the name of the open block. Found a token of type ' + (melodyParser.Types.ERROR_TABLE[unexpectedToken.type] || unexpectedToken.type) + ' instead.'
                    });
                }
            }
        } else {
            blockStatement = new BlockStatement(melodyParser.createNode(melodyTypes.Identifier, nameToken, nameToken.text), new melodyTypes.PrintExpressionStatement(parser.matchExpression()));
        }

        melodyParser.setStartFromToken(blockStatement, token);
        melodyParser.setEndFromToken(blockStatement, tokens.expect(melodyParser.Types.TAG_END));

        blockStatement.trimRightBlock = openingTagEndToken && melodyParser.hasTagEndTokenTrimRight(openingTagEndToken);
        blockStatement.trimLeftEndblock = !!(closingTagStartToken && melodyParser.hasTagStartTokenTrimLeft(closingTagStartToken));

        return blockStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var DoParser = {
    name: 'do',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            doStatement = new DoStatement(parser.matchExpression());
        melodyParser.setStartFromToken(doStatement, token);
        melodyParser.setEndFromToken(doStatement, tokens.expect(melodyParser.Types.TAG_END));
        return doStatement;
    }
};

var EmbedParser = {
    name: 'embed',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        var embedStatement = new EmbedStatement(parser.matchExpression());

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'ignore')) {
            tokens.expect(melodyParser.Types.SYMBOL, 'missing');
            embedStatement.ignoreMissing = true;
        }

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'with')) {
            embedStatement.argument = parser.matchExpression();
        }

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'only')) {
            embedStatement.contextFree = true;
        }

        tokens.expect(melodyParser.Types.TAG_END);
        var openingTagEndToken = tokens.la(-1);
        var closingTagStartToken = void 0;

        embedStatement.blocks = _filter(parser.parse(function (tokenText, token, tokens) {
            var result = !!(token.type === melodyParser.Types.TAG_START && tokens.nextIf(melodyParser.Types.SYMBOL, 'endembed'));
            if (result) {
                closingTagStartToken = token;
            }
            return result;
        }).expressions, melodyTypes.Node.isBlockStatement);

        melodyParser.setStartFromToken(embedStatement, token);
        melodyParser.setEndFromToken(embedStatement, tokens.expect(melodyParser.Types.TAG_END));

        embedStatement.trimRightEmbed = melodyParser.hasTagEndTokenTrimRight(openingTagEndToken);
        embedStatement.trimLeftEndembed = closingTagStartToken && melodyParser.hasTagStartTokenTrimLeft(closingTagStartToken);

        return embedStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ExtendsParser = {
    name: 'extends',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        var extendsStatement = new ExtendsStatement(parser.matchExpression());

        melodyParser.setStartFromToken(extendsStatement, token);
        melodyParser.setEndFromToken(extendsStatement, tokens.expect(melodyParser.Types.TAG_END));

        return extendsStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var FilterParser = {
    name: 'filter',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            ref = melodyParser.createNode(melodyTypes.Identifier, token, 'filter'),
            filterExpression = parser.matchFilterExpression(ref);
        tokens.expect(melodyParser.Types.TAG_END);
        var openingTagEndToken = tokens.la(-1);
        var closingTagStartToken = void 0;

        var body = parser.parse(function (text, token, tokens) {
            var result = token.type === melodyParser.Types.TAG_START && tokens.nextIf(melodyParser.Types.SYMBOL, 'endfilter');

            if (result) {
                closingTagStartToken = token;
            }
            return result;
        }).expressions;

        var filterBlockStatement = new FilterBlockStatement(filterExpression, body);
        melodyParser.setStartFromToken(filterBlockStatement, token);
        melodyParser.setEndFromToken(filterBlockStatement, tokens.expect(melodyParser.Types.TAG_END));

        filterBlockStatement.trimRightFilter = melodyParser.hasTagEndTokenTrimRight(openingTagEndToken);
        filterBlockStatement.trimLeftEndfilter = closingTagStartToken && melodyParser.hasTagStartTokenTrimLeft(closingTagStartToken);

        return filterBlockStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var FlushParser = {
    name: 'flush',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            flushStatement = new FlushStatement();

        melodyParser.setStartFromToken(flushStatement, token);
        melodyParser.setEndFromToken(flushStatement, tokens.expect(melodyParser.Types.TAG_END));
        return flushStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ForParser = {
    name: 'for',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            forStatement = new ForStatement();

        var keyTarget = tokens.expect(melodyParser.Types.SYMBOL);
        if (tokens.nextIf(melodyParser.Types.COMMA)) {
            forStatement.keyTarget = melodyParser.createNode(melodyTypes.Identifier, keyTarget, keyTarget.text);
            var valueTarget = tokens.expect(melodyParser.Types.SYMBOL);
            forStatement.valueTarget = melodyParser.createNode(melodyTypes.Identifier, valueTarget, valueTarget.text);
        } else {
            forStatement.keyTarget = null;
            forStatement.valueTarget = melodyParser.createNode(melodyTypes.Identifier, keyTarget, keyTarget.text);
        }

        tokens.expect(melodyParser.Types.OPERATOR, 'in');

        forStatement.sequence = parser.matchExpression();

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'if')) {
            forStatement.condition = parser.matchExpression();
        }

        tokens.expect(melodyParser.Types.TAG_END);

        var openingTagEndToken = tokens.la(-1);
        var elseTagStartToken = void 0,
            elseTagEndToken = void 0;

        forStatement.body = parser.parse(function (tokenText, token, tokens) {
            var result = token.type === melodyParser.Types.TAG_START && (tokens.test(melodyParser.Types.SYMBOL, 'else') || tokens.test(melodyParser.Types.SYMBOL, 'endfor'));
            if (result && tokens.test(melodyParser.Types.SYMBOL, 'else')) {
                elseTagStartToken = token;
            }
            return result;
        });

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'else')) {
            tokens.expect(melodyParser.Types.TAG_END);
            elseTagEndToken = tokens.la(-1);
            forStatement.otherwise = parser.parse(function (tokenText, token, tokens) {
                return token.type === melodyParser.Types.TAG_START && tokens.test(melodyParser.Types.SYMBOL, 'endfor');
            });
        }
        var endforTagStartToken = tokens.la(-1);
        tokens.expect(melodyParser.Types.SYMBOL, 'endfor');

        melodyParser.setStartFromToken(forStatement, token);
        melodyParser.setEndFromToken(forStatement, tokens.expect(melodyParser.Types.TAG_END));

        forStatement.trimRightFor = melodyParser.hasTagEndTokenTrimRight(openingTagEndToken);
        forStatement.trimLeftElse = !!(elseTagStartToken && melodyParser.hasTagStartTokenTrimLeft(elseTagStartToken));
        forStatement.trimRightElse = !!(elseTagEndToken && melodyParser.hasTagEndTokenTrimRight(elseTagEndToken));
        forStatement.trimLeftEndfor = melodyParser.hasTagStartTokenTrimLeft(endforTagStartToken);

        return forStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var FromParser = {
    name: 'from',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            source = parser.matchExpression(),
            imports = [];

        tokens.expect(melodyParser.Types.SYMBOL, 'import');

        do {
            var name = tokens.expect(melodyParser.Types.SYMBOL);

            var alias = name;
            if (tokens.nextIf(melodyParser.Types.SYMBOL, 'as')) {
                alias = tokens.expect(melodyParser.Types.SYMBOL);
            }

            var importDeclaration = new ImportDeclaration(melodyParser.createNode(melodyTypes.Identifier, name, name.text), melodyParser.createNode(melodyTypes.Identifier, alias, alias.text));
            melodyParser.setStartFromToken(importDeclaration, name);
            melodyParser.setEndFromToken(importDeclaration, alias);

            imports.push(importDeclaration);

            if (!tokens.nextIf(melodyParser.Types.COMMA)) {
                break;
            }
        } while (!tokens.test(melodyParser.Types.EOF));

        var fromStatement = new FromStatement(source, imports);

        melodyParser.setStartFromToken(fromStatement, token);
        melodyParser.setEndFromToken(fromStatement, tokens.expect(melodyParser.Types.TAG_END));

        return fromStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var IfParser = {
    name: 'if',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;
        var test = parser.matchExpression(),
            alternate = null;

        tokens.expect(melodyParser.Types.TAG_END);
        var ifTagEndToken = tokens.la(-1);

        var ifStatement = new IfStatement(test, parser.parse(matchConsequent).expressions);

        var elseTagStartToken = void 0,
            elseTagEndToken = void 0,
            elseifTagStartToken = void 0,
            elseifTagEndToken = void 0;

        do {
            if (tokens.nextIf(melodyParser.Types.SYMBOL, 'else')) {
                elseTagStartToken = tokens.la(-2);
                tokens.expect(melodyParser.Types.TAG_END);
                elseTagEndToken = tokens.la(-1);
                (alternate || ifStatement).alternate = parser.parse(matchAlternate).expressions;
            } else if (tokens.nextIf(melodyParser.Types.SYMBOL, 'elseif')) {
                elseifTagStartToken = tokens.la(-2);
                test = parser.matchExpression();
                tokens.expect(melodyParser.Types.TAG_END);
                elseifTagEndToken = tokens.la(-1);
                var consequent = parser.parse(matchConsequent).expressions;
                alternate = (alternate || ifStatement).alternate = new IfStatement(test, consequent);
                alternate.trimLeft = melodyParser.hasTagStartTokenTrimLeft(elseifTagStartToken);
                alternate.trimRightIf = melodyParser.hasTagEndTokenTrimRight(elseifTagEndToken);
            }

            if (tokens.nextIf(melodyParser.Types.SYMBOL, 'endif')) {
                break;
            }
        } while (!tokens.test(melodyParser.Types.EOF));

        var endifTagStartToken = tokens.la(-2);

        melodyParser.setStartFromToken(ifStatement, token);
        melodyParser.setEndFromToken(ifStatement, tokens.expect(melodyParser.Types.TAG_END));

        ifStatement.trimRightIf = melodyParser.hasTagEndTokenTrimRight(ifTagEndToken);
        ifStatement.trimLeftElse = !!(elseTagStartToken && melodyParser.hasTagStartTokenTrimLeft(elseTagStartToken));
        ifStatement.trimRightElse = !!(elseTagEndToken && melodyParser.hasTagEndTokenTrimRight(elseTagEndToken));
        ifStatement.trimLeftEndif = melodyParser.hasTagStartTokenTrimLeft(endifTagStartToken);

        return ifStatement;
    }
};

function matchConsequent(tokenText, token, tokens) {
    if (token.type === melodyParser.Types.TAG_START) {
        var next = tokens.la(0).text;
        return next === 'else' || next === 'endif' || next === 'elseif';
    }
    return false;
}

function matchAlternate(tokenText, token, tokens) {
    return token.type === melodyParser.Types.TAG_START && tokens.test(melodyParser.Types.SYMBOL, 'endif');
}

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ImportParser = {
    name: 'import',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            source = parser.matchExpression();

        tokens.expect(melodyParser.Types.SYMBOL, 'as');
        var alias = tokens.expect(melodyParser.Types.SYMBOL);

        var importStatement = new ImportDeclaration(source, melodyParser.createNode(melodyTypes.Identifier, alias, alias.text));

        melodyParser.setStartFromToken(importStatement, token);
        melodyParser.setEndFromToken(importStatement, tokens.expect(melodyParser.Types.TAG_END));

        return importStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var IncludeParser = {
    name: 'include',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        var includeStatement = new IncludeStatement(parser.matchExpression());

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'ignore')) {
            tokens.expect(melodyParser.Types.SYMBOL, 'missing');
            includeStatement.ignoreMissing = true;
        }

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'with')) {
            includeStatement.argument = parser.matchExpression();
        }

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'only')) {
            includeStatement.contextFree = true;
        }

        melodyParser.setStartFromToken(includeStatement, token);
        melodyParser.setEndFromToken(includeStatement, tokens.expect(melodyParser.Types.TAG_END));

        return includeStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var MacroParser = {
    name: 'macro',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        var nameToken = tokens.expect(melodyParser.Types.SYMBOL);
        var args = [];

        tokens.expect(melodyParser.Types.LPAREN);
        while (!tokens.test(melodyParser.Types.RPAREN) && !tokens.test(melodyParser.Types.EOF)) {
            var arg = tokens.expect(melodyParser.Types.SYMBOL);
            args.push(melodyParser.createNode(melodyTypes.Identifier, arg, arg.text));

            if (!tokens.nextIf(melodyParser.Types.COMMA) && !tokens.test(melodyParser.Types.RPAREN)) {
                // not followed by comma or rparen
                parser.error({
                    title: 'Expected comma or ")"',
                    pos: tokens.la(0).pos,
                    advice: 'The argument list of a macro can only consist of parameter names separated by commas.'
                });
            }
        }
        tokens.expect(melodyParser.Types.RPAREN);

        var openingTagEndToken = tokens.la(0);
        var closingTagStartToken = void 0;

        var body = parser.parse(function (tokenText, token, tokens) {
            var result = !!(token.type === melodyParser.Types.TAG_START && tokens.nextIf(melodyParser.Types.SYMBOL, 'endmacro'));
            if (result) {
                closingTagStartToken = token;
            }
            return result;
        });

        if (tokens.test(melodyParser.Types.SYMBOL)) {
            var nameEndToken = tokens.next();
            if (nameToken.text !== nameEndToken.text) {
                parser.error({
                    title: 'Macro name mismatch, expected "' + nameToken.text + '" but found "' + nameEndToken.text + '"',
                    pos: nameEndToken.pos
                });
            }
        }

        var macroDeclarationStatement = new MacroDeclarationStatement(melodyParser.createNode(melodyTypes.Identifier, nameToken, nameToken.text), args, body);

        melodyParser.setStartFromToken(macroDeclarationStatement, token);
        melodyParser.setEndFromToken(macroDeclarationStatement, tokens.expect(melodyParser.Types.TAG_END));

        macroDeclarationStatement.trimRightMacro = melodyParser.hasTagEndTokenTrimRight(openingTagEndToken);
        macroDeclarationStatement.trimLeftEndmacro = melodyParser.hasTagStartTokenTrimLeft(closingTagStartToken);

        return macroDeclarationStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var SetParser = {
    name: 'set',
    parse: function parse(parser, token) {
        var tokens = parser.tokens,
            names = [],
            values = [];

        var openingTagEndToken = void 0,
            closingTagStartToken = void 0;

        do {
            var name = tokens.expect(melodyParser.Types.SYMBOL);
            names.push(melodyParser.createNode(melodyTypes.Identifier, name, name.text));
        } while (tokens.nextIf(melodyParser.Types.COMMA));

        if (tokens.nextIf(melodyParser.Types.ASSIGNMENT)) {
            do {
                values.push(parser.matchExpression());
            } while (tokens.nextIf(melodyParser.Types.COMMA));
        } else {
            if (names.length !== 1) {
                parser.error({
                    title: 'Illegal multi-set',
                    pos: tokens.la(0).pos,
                    advice: 'When using set with a block, you cannot have multiple targets.'
                });
            }
            tokens.expect(melodyParser.Types.TAG_END);
            openingTagEndToken = tokens.la(-1);

            values[0] = parser.parse(function (tokenText, token, tokens) {
                var result = !!(token.type === melodyParser.Types.TAG_START && tokens.nextIf(melodyParser.Types.SYMBOL, 'endset'));
                if (result) {
                    closingTagStartToken = token;
                }
                return result;
            }).expressions;
        }

        if (names.length !== values.length) {
            parser.error({
                title: 'Mismatch of set names and values',
                pos: token.pos,
                advice: 'When using set, you must ensure that the number of\nassigned variable names is identical to the supplied values. However, here I\'ve found\n' + names.length + ' variable names and ' + values.length + ' values.'
            });
        }

        // now join names and values
        var assignments = [];
        for (var i = 0, len = names.length; i < len; i++) {
            assignments[i] = new VariableDeclarationStatement(names[i], values[i]);
        }

        var setStatement = new SetStatement(assignments);

        melodyParser.setStartFromToken(setStatement, token);
        melodyParser.setEndFromToken(setStatement, tokens.expect(melodyParser.Types.TAG_END));

        setStatement.trimRightSet = !!(openingTagEndToken && melodyParser.hasTagEndTokenTrimRight(openingTagEndToken));
        setStatement.trimLeftEndset = !!(closingTagStartToken && melodyParser.hasTagStartTokenTrimLeft(closingTagStartToken));

        return setStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var SpacelessParser = {
    name: 'spaceless',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        tokens.expect(melodyParser.Types.TAG_END);
        var openingTagEndToken = tokens.la(-1);
        var closingTagStartToken = void 0;

        var body = parser.parse(function (tokenText, token, tokens) {
            var result = !!(token.type === melodyParser.Types.TAG_START && tokens.nextIf(melodyParser.Types.SYMBOL, 'endspaceless'));
            closingTagStartToken = token;
            return result;
        }).expressions;

        var spacelessBlock = new SpacelessBlock(body);
        melodyParser.setStartFromToken(spacelessBlock, token);
        melodyParser.setEndFromToken(spacelessBlock, tokens.expect(melodyParser.Types.TAG_END));

        spacelessBlock.trimRightSpaceless = melodyParser.hasTagEndTokenTrimRight(openingTagEndToken);
        spacelessBlock.trimLeftEndspaceless = !!(closingTagStartToken && melodyParser.hasTagStartTokenTrimLeft(closingTagStartToken));

        return spacelessBlock;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var UseParser = {
    name: 'use',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        var source = parser.matchExpression(),
            aliases = [];

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'with')) {
            do {
                var nameToken = tokens.expect(melodyParser.Types.SYMBOL),
                    name = melodyParser.createNode(melodyTypes.Identifier, nameToken, nameToken.text);
                var alias = name;
                if (tokens.nextIf(melodyParser.Types.SYMBOL, 'as')) {
                    var aliasToken = tokens.expect(melodyParser.Types.SYMBOL);
                    alias = melodyParser.createNode(melodyTypes.Identifier, aliasToken, aliasToken.text);
                }
                var aliasExpression = new AliasExpression(name, alias);
                melodyParser.copyStart(aliasExpression, name);
                melodyParser.copyEnd(aliasExpression, alias);
                aliases.push(aliasExpression);
            } while (tokens.nextIf(melodyParser.Types.COMMA));
        }

        var useStatement = new UseStatement(source, aliases);

        melodyParser.setStartFromToken(useStatement, token);
        melodyParser.setEndFromToken(useStatement, tokens.expect(melodyParser.Types.TAG_END));

        return useStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var MountParser = {
    name: 'mount',
    parse: function parse(parser, token) {
        var tokens = parser.tokens;

        var name = null,
            source = null,
            key = null,
            async = false,
            delayBy = 0,
            argument = null;

        if (tokens.test(melodyParser.Types.SYMBOL, 'async')) {
            // we might be looking at an async mount
            var nextToken = tokens.la(1);
            if (nextToken.type === melodyParser.Types.STRING_START) {
                async = true;
                tokens.next();
            }
        }

        if (tokens.test(melodyParser.Types.STRING_START)) {
            source = parser.matchStringExpression();
        } else {
            var nameToken = tokens.expect(melodyParser.Types.SYMBOL);
            name = melodyParser.createNode(melodyTypes.Identifier, nameToken, nameToken.text);
            if (tokens.nextIf(melodyParser.Types.SYMBOL, 'from')) {
                source = parser.matchStringExpression();
            }
        }

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'as')) {
            key = parser.matchExpression();
        }

        if (tokens.nextIf(melodyParser.Types.SYMBOL, 'with')) {
            argument = parser.matchExpression();
        }

        if (async) {
            if (tokens.nextIf(melodyParser.Types.SYMBOL, 'delay')) {
                tokens.expect(melodyParser.Types.SYMBOL, 'placeholder');
                tokens.expect(melodyParser.Types.SYMBOL, 'by');
                delayBy = Number.parseInt(tokens.expect(melodyParser.Types.NUMBER).text, 10);
                if (tokens.nextIf(melodyParser.Types.SYMBOL, 's')) {
                    delayBy *= 1000;
                } else {
                    tokens.expect(melodyParser.Types.SYMBOL, 'ms');
                }
            }
        }

        var mountStatement = new MountStatement(name, source, key, argument, async, delayBy);

        var openingTagEndToken = void 0,
            catchTagStartToken = void 0,
            catchTagEndToken = void 0,
            endmountTagStartToken = void 0;

        if (async) {
            tokens.expect(melodyParser.Types.TAG_END);
            openingTagEndToken = tokens.la(-1);

            mountStatement.body = parser.parse(function (tokenText, token, tokens) {
                return token.type === melodyParser.Types.TAG_START && (tokens.test(melodyParser.Types.SYMBOL, 'catch') || tokens.test(melodyParser.Types.SYMBOL, 'endmount'));
            });

            if (tokens.nextIf(melodyParser.Types.SYMBOL, 'catch')) {
                catchTagStartToken = tokens.la(-2);
                var errorVariableName = tokens.expect(melodyParser.Types.SYMBOL);
                mountStatement.errorVariableName = melodyParser.createNode(melodyTypes.Identifier, errorVariableName, errorVariableName.text);
                tokens.expect(melodyParser.Types.TAG_END);
                catchTagEndToken = tokens.la(-1);
                mountStatement.otherwise = parser.parse(function (tokenText, token, tokens) {
                    return token.type === melodyParser.Types.TAG_START && tokens.test(melodyParser.Types.SYMBOL, 'endmount');
                });
            }
            tokens.expect(melodyParser.Types.SYMBOL, 'endmount');
            endmountTagStartToken = tokens.la(-2);
        }

        melodyParser.setStartFromToken(mountStatement, token);
        melodyParser.setEndFromToken(mountStatement, tokens.expect(melodyParser.Types.TAG_END));

        mountStatement.trimRightMount = !!(openingTagEndToken && melodyParser.hasTagEndTokenTrimRight(openingTagEndToken));
        mountStatement.trimLeftCatch = !!(catchTagStartToken && melodyParser.hasTagStartTokenTrimLeft(catchTagStartToken));
        mountStatement.trimRightCatch = !!(catchTagEndToken && melodyParser.hasTagEndTokenTrimRight(catchTagEndToken));
        mountStatement.trimLeftEndmount = !!(endmountTagStartToken && melodyParser.hasTagStartTokenTrimLeft(endmountTagStartToken));

        return mountStatement;
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @param template
// @returns function
//     @param context context bindings
//     @returns {exprStmt, initDecl, forStmt}
var template = function template(tpl) {
    return function (ctx) {
        return parseExpr(babelTemplate(tpl)(ctx));
    };
};

var forWithContext = template('\n{\nlet SEQUENCE = SOURCE,\nKEY_TARGET = 0,\nLENGTH = SEQUENCE.length,\nSUB_CONTEXT = CREATE_SUB_CONTEXT(CONTEXT, {\n    VALUE_TARGET: SEQUENCE[0],\n    loop: {\n        index: 1,\n        index0: 0,\n        length: LENGTH,\n        revindex: LENGTH,\n        revindex0: LENGTH - 1,\n        first: true,\n        last: 1 === LENGTH\n    }\n});\nfor (;\n    KEY_TARGET < LENGTH;\n    KEY_TARGET++\n) {\n    SUB_CONTEXT.loop.index0++;\n    SUB_CONTEXT.loop.index++;\n    SUB_CONTEXT.loop.revindex--;\n    SUB_CONTEXT.loop.revindex0--;\n    SUB_CONTEXT.loop.first = false;\n    SUB_CONTEXT.loop.last = SUB_CONTEXT.loop.revindex === 0;\n    SUB_CONTEXT.VALUE_TARGET = _sequence[KEY_TARGET + 1];\n}\n}\n');

var basicFor = template('\n{\nlet SEQUENCE = SOURCE,\nKEY_TARGET = 0,\nLENGTH = SEQUENCE.length,\nVALUE_TARGET = SEQUENCE[0];\nfor (;\n    KEY_TARGET < LENGTH;\n    KEY_TARGET++,\n    VALUE_TARGET = SEQUENCE[_index]\n) {\n}\n}\n');

var localFor = template('\n{\nlet SEQUENCE = SOURCE,\nKEY_TARGET = 0,\nLENGTH = SEQUENCE.length,\nVALUE_TARGET = SEQUENCE[0],\nINDEX_BY_1 = 1,\nREVERSE_INDEX_BY_1 = LENGTH,\nREVERSE_INDEX = LENGTH - 1,\nFIRST = true,\nLAST = 1 === LENGTH;\nfor (;\n    KEY_TARGET < LENGTH;\n    KEY_TARGET++,\n    VALUE_TARGET = SEQUENCE[_index]\n) {\n    INDEX_BY_1++;\n    REVERSE_INDEX_BY_1--;\n    REVERSE_INDEX--;\n    FIRST = false;\n    LAST = REVERSE_INDEX === 0;\n}\n}\n');

// returns an object that has the whole expression, init declarations, for loop
// statement in respective properties.
function parseExpr(exprStmt) {
    return {
        exprStmt: exprStmt,
        initDecl: exprStmt.body[0].declarations,
        forStmt: exprStmt.body[1]
    };
}

var forVisitor = {
    analyse: {
        ForStatement: {
            enter: function enter(path) {
                var forStmt = path.node,
                    scope = path.scope;
                if (forStmt.keyTarget) {
                    scope.registerBinding(forStmt.keyTarget.name, path.get('keyTarget'), 'var');
                }
                if (forStmt.valueTarget) {
                    scope.registerBinding(forStmt.valueTarget.name, path.get('valueTarget'), 'var');
                }
                scope.registerBinding('loop', path, 'var');
            },
            exit: function exit(path) {
                var sequenceName = path.scope.generateUid('sequence'),
                    lenName = path.scope.generateUid('length');
                path.scope.registerBinding(sequenceName, path, 'var');
                path.scope.registerBinding(lenName, path, 'var');
                var iName = void 0;
                if (path.node.keyTarget) {
                    iName = path.node.keyTarget.name;
                } else {
                    iName = path.scope.generateUid('index0');
                    path.scope.registerBinding(iName, path, 'var');
                }
                path.setData('forStatement.variableLookup', {
                    sequenceName: sequenceName,
                    lenName: lenName,
                    iName: iName
                });

                if (path.scope.escapesContext) {
                    var contextName = path.scope.generateUid('context');
                    path.scope.registerBinding(contextName, path, 'const');
                    path.scope.contextName = contextName;
                    path.scope.getBinding('loop').kind = 'context';
                    if (path.node.valueTarget) {
                        path.scope.getBinding(path.node.valueTarget.name).kind = 'context';
                    }
                } else if (path.scope.getBinding('loop').references) {
                    var indexName = path.scope.generateUid('index');
                    path.scope.registerBinding(indexName, path, 'var');
                    var revindexName = path.scope.generateUid('revindex');
                    path.scope.registerBinding(revindexName, path, 'var');
                    var revindex0Name = path.scope.generateUid('revindex0');
                    path.scope.registerBinding(revindex0Name, path, 'var');
                    var firstName = path.scope.generateUid('first');
                    path.scope.registerBinding(firstName, path, 'var');
                    var lastName = path.scope.generateUid('last');
                    path.scope.registerBinding(lastName, path, 'var');

                    var lookupTable = {
                        index: indexName,
                        index0: iName,
                        length: lenName,
                        revindex: revindexName,
                        revindex0: revindex0Name,
                        first: firstName,
                        last: lastName
                    };
                    path.setData('forStatement.loopLookup', lookupTable);

                    var loopBinding = path.scope.getBinding('loop');
                    for (var _iterator = loopBinding.referencePaths, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                        var _ref;

                        if (_isArray) {
                            if (_i >= _iterator.length) break;
                            _ref = _iterator[_i++];
                        } else {
                            _i = _iterator.next();
                            if (_i.done) break;
                            _ref = _i.value;
                        }

                        var loopPath = _ref;

                        var memExpr = loopPath.parentPath;

                        if (memExpr.is('MemberExpression')) {
                            var typeName = memExpr.node.property.name;
                            if (typeName === 'index0') {
                                memExpr.replaceWithJS({
                                    type: 'BinaryExpression',
                                    operator: '-',
                                    left: {
                                        type: 'Identifier',
                                        name: indexName
                                    },
                                    right: { type: 'NumericLiteral', value: 1 },
                                    extra: {
                                        parenthesized: true
                                    }
                                });
                            } else {
                                memExpr.replaceWithJS({
                                    type: 'Identifier',
                                    name: lookupTable[typeName]
                                });
                            }
                        }
                    }
                }
            }
        }
    },
    convert: {
        ForStatement: {
            enter: function enter(path) {
                if (path.scope.escapesContext) {
                    var parentContextName = path.scope.parent.contextName;
                    if (path.node.otherwise) {
                        var alternate = path.get('otherwise');
                        if (alternate.is('Scope')) {
                            alternate.scope.contextName = parentContextName;
                        }
                    }

                    var sequence = path.get('sequence');

                    if (sequence.is('Identifier')) {
                        sequence.setData('Identifier.contextName', parentContextName);
                    } else {
                        melodyTraverse.traverse(path.node.sequence, {
                            Identifier: function Identifier(id) {
                                id.setData('Identifier.contextName', parentContextName);
                            }
                        });
                    }
                }
            },
            exit: function exit(path) {
                var _expr$forStmt$body$bo;

                var node = path.node;

                var _path$getData = path.getData('forStatement.variableLookup'),
                    sequenceName = _path$getData.sequenceName,
                    lenName = _path$getData.lenName,
                    iName = _path$getData.iName;

                var expr = void 0;
                if (path.scope.escapesContext) {
                    var contextName = path.scope.contextName;
                    expr = forWithContext({
                        CONTEXT: t.identifier(path.scope.parent.contextName),
                        SUB_CONTEXT: t.identifier(contextName),
                        CREATE_SUB_CONTEXT: t.identifier(this.addImportFrom('melody-runtime', 'createSubContext')),
                        KEY_TARGET: t.identifier(iName),
                        SOURCE: path.get('sequence').node,
                        SEQUENCE: t.identifier(sequenceName),
                        LENGTH: t.identifier(lenName),
                        VALUE_TARGET: node.valueTarget
                    });
                    if (node.keyTarget) {
                        expr.forStmt.body.body.push({
                            type: 'ExpressionStatement',
                            expression: {
                                type: 'AssignmentExpression',
                                operator: '=',
                                left: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: contextName
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: node.keyTarget.name
                                    },
                                    computed: false
                                },
                                right: {
                                    type: 'Identifier',
                                    name: iName
                                }
                            }
                        });
                        expr.initDecl[expr.initDecl.length - 1].init.arguments[1].properties.push({
                            type: 'ObjectProperty',
                            method: false,
                            shorthand: false,
                            computed: false,
                            key: {
                                type: 'Identifier',
                                name: node.keyTarget.name
                            },
                            value: {
                                type: 'Identifier',
                                name: iName
                            }
                        });
                    }
                } else if (path.scope.getBinding('loop').references) {
                    var _path$getData2 = path.getData('forStatement.loopLookup'),
                        indexName = _path$getData2.index,
                        revindexName = _path$getData2.revindex,
                        revindex0Name = _path$getData2.revindex0,
                        firstName = _path$getData2.first,
                        lastName = _path$getData2.last;

                    expr = localFor({
                        KEY_TARGET: t.identifier(iName),
                        SOURCE: path.get('sequence').node,
                        SEQUENCE: t.identifier(sequenceName),
                        LENGTH: t.identifier(lenName),
                        VALUE_TARGET: node.valueTarget,
                        INDEX_BY_1: t.identifier(indexName),
                        REVERSE_INDEX: t.identifier(revindex0Name),
                        REVERSE_INDEX_BY_1: t.identifier(revindexName),
                        FIRST: t.identifier(firstName),
                        LAST: t.identifier(lastName)
                    });
                } else {
                    expr = basicFor({
                        SEQUENCE: t.identifier(sequenceName),
                        SOURCE: path.get('sequence').node,
                        KEY_TARGET: t.identifier(iName),
                        LENGTH: t.identifier(lenName),
                        VALUE_TARGET: node.valueTarget
                    });
                }

                (_expr$forStmt$body$bo = expr.forStmt.body.body).unshift.apply(_expr$forStmt$body$bo, path.get('body').node.body);

                var uniteratedName = void 0;
                if (node.otherwise) {
                    uniteratedName = path.scope.generateUid('uniterated');
                    path.scope.parent.registerBinding(uniteratedName, path, 'var');
                    expr.forStmt.body.body.push(t.expressionStatement(t.assignmentExpression('=', t.identifier(uniteratedName), t.booleanLiteral(false))));
                }

                if (node.condition) {
                    expr.forStmt.body = t.blockStatement([{
                        type: 'IfStatement',
                        test: node.condition,
                        consequent: t.blockStatement(expr.forStmt.body.body)
                    }]);
                }

                if (uniteratedName) {
                    path.replaceWithMultipleJS(t.variableDeclaration('let', [t.variableDeclarator(t.identifier(uniteratedName), t.booleanLiteral(true))]), expr.exprStmt, t.ifStatement(t.identifier(uniteratedName), node.otherwise));
                } else {
                    path.replaceWithJS(expr.exprStmt);
                }
            }
        }
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var testVisitor = {
    convert: {
        TestEvenExpression: {
            exit: function exit(path) {
                var expr = t.unaryExpression('!', t.binaryExpression('%', path.get('expression').node, t.numericLiteral(2)));
                expr.extra = { parenthesizedArgument: true };
                path.replaceWithJS(expr);
            }
        },
        TestOddExpression: {
            exit: function exit(path) {
                var expr = t.unaryExpression('!', t.unaryExpression('!', t.binaryExpression('%', path.get('expression').node, t.numericLiteral(2))));
                expr.extra = { parenthesizedArgument: true };
                path.replaceWithJS(expr);
            }
        },
        TestDefinedExpression: {
            exit: function exit(path) {
                path.replaceWithJS(t.binaryExpression('!==', t.unaryExpression('typeof', path.get('expression').node), t.stringLiteral('undefined')));
            }
        },
        TestEmptyExpression: {
            exit: function exit(path) {
                path.replaceWithJS(t.callExpression(t.identifier(this.addImportFrom('melody-runtime', 'isEmpty')), [path.get('expression').node]));
            }
        },
        TestSameAsExpression: {
            exit: function exit(path) {
                path.replaceWithJS(t.binaryExpression('===', path.get('expression').node, path.get('arguments')[0].node));
            }
        },
        TestNullExpression: {
            exit: function exit(path) {
                path.replaceWithJS(t.binaryExpression('===', path.get('expression').node, t.nullLiteral()));
            }
        },
        TestDivisibleByExpression: {
            exit: function exit(path) {
                path.replaceWithJS(t.unaryExpression('!', t.binaryExpression('%', path.get('expression').node, path.node.arguments[0])));
            }
        },
        TestIterableExpression: {
            exit: function exit(path) {
                path.replaceWithJS(t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('isArray')), [path.node.expression]));
            }
        }
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// use default value if var is null, undefined or an empty string
// but use var if value is 0, false, an empty array or an empty object
var defaultFilter = babelTemplate("VAR != null && VAR !== '' ? VAR : DEFAULT");

var filters = {
    capitalize: 'lodash',
    first: 'lodash',
    last: 'lodash',
    keys: 'lodash',
    default: function _default(path) {
        // babel-template transforms it to an expression statement
        // but we really need an expression here, so unwrap it
        path.replaceWithJS(defaultFilter({
            VAR: path.node.target,
            DEFAULT: path.node.arguments[0] || t.stringLiteral('')
        }).expression);
    },
    abs: function abs(path) {
        // todo throw error if arguments exist
        path.replaceWithJS(t.callExpression(t.memberExpression(t.identifier('Math'), t.identifier('abs')), [path.node.target]));
    },
    join: function join(path) {
        path.replaceWithJS(t.callExpression(t.memberExpression(path.node.target, t.identifier('join')), path.node.arguments));
    },
    json_encode: function json_encode(path) {
        // todo: handle arguments
        path.replaceWithJS(t.callExpression(t.memberExpression(t.identifier('JSON'), t.identifier('stringify')), [path.node.target]));
    },
    length: function length(path) {
        path.replaceWithJS(t.memberExpression(path.node.target, t.identifier('length')));
    },
    lower: function lower(path) {
        path.replaceWithJS(t.callExpression(t.memberExpression(path.node.target, t.identifier('toLowerCase')), []));
    },
    upper: function upper(path) {
        path.replaceWithJS(t.callExpression(t.memberExpression(path.node.target, t.identifier('toUpperCase')), []));
    },
    slice: function slice(path) {
        path.replaceWithJS(t.callExpression(t.memberExpression(path.node.target, t.identifier('slice')), path.node.arguments));
    },
    sort: function sort(path) {
        path.replaceWithJS(t.callExpression(t.memberExpression(path.node.target, t.identifier('sort')), path.node.arguments));
    },
    split: function split(path) {
        path.replaceWithJS(t.callExpression(t.memberExpression(path.node.target, t.identifier('split')), path.node.arguments));
    },
    convert_encoding: function convert_encoding(path) {
        // encoding conversion is not supported
        path.replaceWith(path.node.target);
    },
    date_modify: function date_modify(path) {
        path.replaceWithJS(t.callExpression(t.identifier(path.state.addImportFrom('melody-runtime', 'strtotime')), [path.node.arguments[0], path.node.target]));
    },
    date: function date(path) {
        // Not really happy about this since moment.js could well be incompatible with
        // the default twig behaviour
        // might need to switch to an actual strftime implementation
        path.replaceWithJS(t.callExpression(t.callExpression(t.identifier(path.state.addDefaultImportFrom('moment')), [path.node.target]), [path.node.arguments[0]]));
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function addOne(expr) {
    return t.binaryExpression('+', expr, t.numericLiteral(1));
}

var functions = {
    range: function range(path) {
        var args = path.node.arguments;
        var callArgs = [];
        if (args.length === 1) {
            callArgs.push(addOne(args[0]));
        } else if (args.length === 3) {
            callArgs.push(args[0]);
            callArgs.push(addOne(args[1]));
            callArgs.push(args[2]);
        } else if (args.length === 2) {
            callArgs.push(args[0], addOne(args[1]));
        } else {
            path.state.error('Invalid range call', path.node.pos, 'The range function accepts 1 to 3 arguments but you have specified ' + args.length + ' arguments instead.');
        }

        path.replaceWithJS(t.callExpression(t.identifier(path.state.addImportFrom('lodash', 'range')), callArgs));
    },

    // range: 'lodash',
    dump: function dump(path) {
        if (!path.parentPath.is('PrintExpressionStatement')) {
            path.state.error('dump must be used in a lone expression', path.node.pos, 'The dump function does not have a return value. Thus it must be used as the only expression.');
        }
        path.parentPath.replaceWithJS(t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('console'), t.identifier('log')), path.node.arguments)));
    },
    include: function include(path) {
        if (!path.parentPath.is('PrintExpressionStatement')) {
            path.state.error({
                title: 'Include function does not return value',
                pos: path.node.loc.start,
                advice: 'The include function currently does not return a value.\n                Thus you must use it like a regular include tag.'
            });
        }
        var includeName = path.scope.generateUid('include');
        var importDecl = t.importDeclaration([t.importDefaultSpecifier(t.identifier(includeName))], path.node.arguments[0]);
        path.state.program.body.splice(0, 0, importDecl);
        path.scope.registerBinding(includeName);

        var argument = path.node.arguments[1];

        var includeCall = t.expressionStatement(t.callExpression(t.memberExpression(t.identifier(includeName), t.identifier('render')), argument ? [argument] : []));
        path.replaceWithJS(includeCall);
    }
};

/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var filterMap = ['attrs', 'classes', 'styles', 'batch', 'escape', 'format', 'merge', 'nl2br', 'number_format', 'raw', 'replace', 'reverse', 'round', 'striptags', 'title', 'url_encode', 'trim'].reduce(function (map, filterName) {
    map[filterName] = 'melody-runtime';
    return map;
}, Object.create(null));

Object.assign(filterMap, filters);

var functionMap = ['attribute', 'constant', 'cycle', 'date', 'max', 'min', 'random', 'range', 'source', 'template_from_string'].reduce(function (map, functionName) {
    map[functionName] = 'melody-runtime';
    return map;
}, Object.create(null));
Object.assign(functionMap, functions);

var extension = {
    tags: [AutoescapeParser, BlockParser, DoParser, EmbedParser, ExtendsParser, FilterParser, FlushParser, ForParser, FromParser, IfParser, ImportParser, IncludeParser, MacroParser, SetParser, SpacelessParser, UseParser, MountParser],
    unaryOperators: unaryOperators,
    binaryOperators: binaryOperators,
    tests: tests,
    visitors: [forVisitor, testVisitor],
    filterMap: filterMap,
    functionMap: functionMap
};

exports.extension = extension;
exports.AutoescapeBlock = AutoescapeBlock;
exports.BlockStatement = BlockStatement;
exports.BlockCallExpression = BlockCallExpression;
exports.MountStatement = MountStatement;
exports.DoStatement = DoStatement;
exports.EmbedStatement = EmbedStatement;
exports.ExtendsStatement = ExtendsStatement;
exports.FilterBlockStatement = FilterBlockStatement;
exports.FlushStatement = FlushStatement;
exports.ForStatement = ForStatement;
exports.ImportDeclaration = ImportDeclaration;
exports.FromStatement = FromStatement;
exports.IfStatement = IfStatement;
exports.IncludeStatement = IncludeStatement;
exports.MacroDeclarationStatement = MacroDeclarationStatement;
exports.VariableDeclarationStatement = VariableDeclarationStatement;
exports.SetStatement = SetStatement;
exports.SpacelessBlock = SpacelessBlock;
exports.AliasExpression = AliasExpression;
exports.UseStatement = UseStatement;
exports.UnaryNotExpression = UnaryNotExpression;
exports.UnaryNeqExpression = UnaryNeqExpression;
exports.UnaryPosExpression = UnaryPosExpression;
exports.BinaryOrExpression = BinaryOrExpression;
exports.BinaryAndExpression = BinaryAndExpression;
exports.BitwiseOrExpression = BitwiseOrExpression;
exports.BitwiseXorExpression = BitwiseXorExpression;
exports.BitwiseAndExpression = BitwiseAndExpression;
exports.BinaryEqualsExpression = BinaryEqualsExpression;
exports.BinaryNotEqualsExpression = BinaryNotEqualsExpression;
exports.BinaryLessThanExpression = BinaryLessThanExpression;
exports.BinaryGreaterThanExpression = BinaryGreaterThanExpression;
exports.BinaryLessThanOrEqualExpression = BinaryLessThanOrEqualExpression;
exports.BinaryGreaterThanOrEqualExpression = BinaryGreaterThanOrEqualExpression;
exports.BinaryNotInExpression = BinaryNotInExpression;
exports.BinaryInExpression = BinaryInExpression;
exports.BinaryMatchesExpression = BinaryMatchesExpression;
exports.BinaryStartsWithExpression = BinaryStartsWithExpression;
exports.BinaryEndsWithExpression = BinaryEndsWithExpression;
exports.BinaryRangeExpression = BinaryRangeExpression;
exports.BinaryAddExpression = BinaryAddExpression;
exports.BinaryMulExpression = BinaryMulExpression;
exports.BinaryDivExpression = BinaryDivExpression;
exports.BinaryFloorDivExpression = BinaryFloorDivExpression;
exports.BinaryModExpression = BinaryModExpression;
exports.BinaryPowerExpression = BinaryPowerExpression;
exports.BinaryNullCoalesceExpression = BinaryNullCoalesceExpression;
exports.TestEvenExpression = TestEvenExpression;
exports.TestOddExpression = TestOddExpression;
exports.TestDefinedExpression = TestDefinedExpression;
exports.TestSameAsExpression = TestSameAsExpression;
exports.TestNullExpression = TestNullExpression;
exports.TestDivisibleByExpression = TestDivisibleByExpression;
exports.TestConstantExpression = TestConstantExpression;
exports.TestEmptyExpression = TestEmptyExpression;
exports.TestIterableExpression = TestIterableExpression;
