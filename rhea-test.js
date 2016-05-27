import CassowaryRhea from './rhea.js';

var assert = {};
assert.ok = function(test, msg) {
    if (!test) throw new Error(msg || "Assertion failed")
}
assert.equal = function(a, b) {
    if (a != b) throw new Error("Expected " + a + " to equal " + b);
}

describe("Rhea", function() {
  var rhea = new CassowaryRhea("/lively4/rhea/rhea.emscripten.js");

  beforeEach(function () {
    this.rc = new rhea.ReferenceCounterRoot();
    this.deleteAll = function () {
      for (var i = 0; i < arguments.length; i++) {
        arguments[i].delete();
      }
    };
  });

  afterEach(function () {
    this.rc.deleteAll();
  });

  describe("Run - New API", function () {
    it("should create a Variable", function () {
      var v1 = new rhea.Variable({ value: 12 });
      assert.equal(v1.value, 12);
      this.rc.add(v1);
    });

    it("should modify a Variable", function () {
      var v1 = new rhea.Variable({ value: 12 });
      v1.set(23);
      assert.equal(v1.value, 23);
      this.rc.add(v1);
    });

    it("should create expressions", function () {
      var v1 = new rhea.Variable({ value: 1 });
      var v2 = new rhea.Variable({ value: 2 });

      var e1 = rhea.plus(v1, v2);
      var e2 = rhea.minus(v1, v2);

      var e3 = rhea.plus(v1, 3);
      var e4 = rhea.minus(v1, 3);
      var e5 = rhea.times(v1, 3);
      var e6 = rhea.divide(v1, 2);

      var e7 = rhea.plus(3, v2);
      var e8 = rhea.minus(3, v2);
      var e9 = rhea.times(3, v2);

      var e10 = new rhea.Expression(3);
      var e11 = rhea.plus(v1, e1);
      var e12 = rhea.plus(e1, v1);
      var e13 = rhea.plus(e1, e2);

      assert.equal(e1.evaluate(), 3);
      assert.equal(e2.evaluate(), -1);

      assert.equal(e3.evaluate(), 4);
      assert.equal(e4.evaluate(), -2);
      assert.equal(e5.evaluate(), 3);
      assert.equal(e6.evaluate(), 0.5);

      assert.equal(e7.evaluate(), 5);
      assert.equal(e8.evaluate(), 1);
      assert.equal(e9.evaluate(), 6);

      assert.equal(e10.evaluate(), 3);
      assert.equal(e11.evaluate(), 4);
      assert.equal(e12.evaluate(), 4);
      assert.equal(e13.evaluate(), 2);

      this.rc.add(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13);
    });

    it("should create equations", function () {
      var v1 = new rhea.Variable({ value: 1 });
      var v2 = new rhea.Variable({ value: 2 });

      var e1 = rhea.plus(v1, v2);
      var e2 = rhea.minus(v2, v1);

      var eq1 = new rhea.Equation(e1, v2);
      var eq2 = new rhea.Equation(v1, e2);
      var eq3 = new rhea.Equation(v1, v2);
      var eq4 = new rhea.Equation(e1, e2);
      var eq5 = new rhea.Equation(v2, 2);
      var eq6 = new rhea.Equation(e1, 3);

      assert.ok(!eq1.isSatisfied()); // v1 + v2 == v2
      assert.ok(eq2.isSatisfied()); // v1 == v2 - v1
      assert.ok(!eq3.isSatisfied()); // v1 == v2
      assert.ok(!eq4.isSatisfied()); // v1 + v2 == v1 - v2
      assert.ok(eq5.isSatisfied()); // v2 == 2
      assert.ok(eq6.isSatisfied()); // v1 + v2 == 3

      this.rc.add(eq1, eq2, eq3, eq4, eq5, eq6);
    });

    it("should create inequalities", function () {
      var v1 = new rhea.Variable({ value: 1 });
      var v2 = new rhea.Variable({ value: 2 });

      var e1 = rhea.plus(v1, v2);
      var e2 = rhea.minus(v1, v2);

      var eq1 = new rhea.Inequality(e1, "<=", e2);
      var eq2 = new rhea.Inequality(v1, ">=", e2);
      var eq3 = new rhea.Inequality(v1, "<=", v2);
      var eq4 = new rhea.Inequality(v1, ">=", 3);
      var eq5 = new rhea.Inequality(e1, ">=", 4);

      assert.ok(!eq1.isSatisfied()); // v1 + v2 <= v1 - v2
      assert.ok(eq2.isSatisfied()); // v1 >= v1 - v2
      assert.ok(eq3.isSatisfied()); // v1 <= v2
      assert.ok(!eq4.isSatisfied()); // v1 >= 3
      assert.ok(!eq5.isSatisfied()); // v1 + v2 >= 4

      this.rc.add(eq1, eq2, eq3, eq4, eq5);
    });

    it("should create constraints", function () {
      var v1 = new rhea.Variable({ value: 1 });
      var eq1 = new rhea.Equation(v1, 2);
      var eq2 = new rhea.Inequality(v1, "<=", 2);

      var c1 = new rhea.Constraint(eq1);
      var c2 = new rhea.Constraint(eq2);

      assert.ok(!c1.isSatisfied());
      assert.ok(c2.isSatisfied());

      this.rc.add(c1, c2);
    });

    it("should create a solver", function () {
      var v1 = new rhea.Variable({ value: 1 });
      var eq1 = new rhea.Equation(v1, 2);

      var s1 = new rhea.SimplexSolver();
      s1.addConstraint(eq1);

      this.rc.add(s1);
    });

    it("should solve an equation", function () {
      var v1 = new rhea.Variable({ value: 3 });
      var v2 = new rhea.Variable({ value: 2 });

      var e1 = rhea.minus(v1, 1);
      var eq1 = new rhea.Equation(e1, v2);

      var s1 = new rhea.SimplexSolver();
      s1.addConstraint(eq1);
      s1.solve();
      assert.ok(v1.value - 1 == v2.value);

      this.rc.add(s1);
    });

    it("should solve an inequality", function () {
      var v1 = new rhea.Variable({ value: 3 });
      var v2 = new rhea.Variable({ value: 4 });

      var eq1 = new rhea.Inequality(v1, ">=", v2);

      var s1 = new rhea.SimplexSolver();
      s1.addConstraint(eq1);
      s1.solve();
      assert.ok(v1.value >= v2.value);

      this.rc.add(s1);
    });

    it("should remove constraints", function () {
      var v1 = new rhea.Variable({ value: 3 });
      var v2 = new rhea.Variable({ value: 4 });

      var eq1 = new rhea.Inequality(v1, ">=", v2);
      var c1 = new rhea.Constraint(eq1);

      var s1 = new rhea.SimplexSolver();
      s1.addConstraint(c1);
      s1.solve();
      assert.ok(v1.value >= v2.value);
      s1.removeConstraint(c1);

      this.rc.add(s1);
    });

    it("should solve multiple constraints", function () {
      var v1 = new rhea.Variable();
      var v2 = new rhea.Variable();

      // v1 - 1 == v2
      var e1 = rhea.minus(v1, 1);
      var eq1 = new rhea.Equation(e1, v2);

      // v1 >= 2
      var eq2 = new rhea.Inequality(v1, ">=", 2);

      var s1 = new rhea.SimplexSolver();
      s1.addConstraint(eq1);
      s1.addConstraint(eq2);
      s1.solve();

      assert.ok(v1.value - 1 == v2.value);
      assert.ok(v1.value >= 2);

      this.rc.add(s1);
    });
  });
});
