class Validate {
  // Validate undefined
  async undefinedCheck(val, par) {
    if (val === undefined) {
      throw { msg: `${par} field is required`, code: 400, validate: null };
    }
  }
  // Null value and string validation
  async nullCheck(val, tips, par) {
    await this.undefinedCheck(val, par);
    if (val.trim() === "") {
      throw { msg: tips, code: 422, validate: null };
    }
    if (typeof val !== "string") {
      throw {
        msg: `${par} field must be string type`,
        code: 400,
        validate: null,
      };
    }
  }
  // Validate array type
  async isarrayCheck(val, tips, par) {
    await this.undefinedCheck(val, par);
    if (!Array.isArray(val)) {
      throw {
        msg: `${par} field must be array type`,
        code: 400,
        validate: null,
      };
    }
    if (val.length <= 0) {
      throw { msg: tips, code: 422, validate: null };
    }
  }
}
module.exports = new Validate();
