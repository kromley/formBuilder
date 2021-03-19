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

  getFieldData(name) {
    if (!this.formData || Object.keys(this.formData).length == 0)
      return null
    const formData = (typeof this.formData) == 'string' ? JSON.parse(this.formData) : this.formData
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
