export const instanceData = {}

/**
 * Data Class
 * @todo  refactor. this should just be a standard Object
 * unless we move all data functionality here.
 */
export class Data {
  /**
   * Set defaults
   * @param  {String} formID
   */
  constructor(formID) {
    this.formData = {}
    this.formID = formID
    this.layout = ''
    instanceData[formID] = this
  }

  static getFieldData(formDataIn, name) {
    if (!formDataIn || Object.keys(formDataIn).length == 0)
      return null
    const formData = (typeof formDataIn) == 'string' ? JSON.parse(formDataIn) : formDataIn
    for (let i=0; i < formData.length; i++) {
      const field = formData[i]
      if (field.name == name) {
        return field
      }
    }
    return null
  }

}

export const availablefields = {}
