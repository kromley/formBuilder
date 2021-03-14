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
    this.registeredControls = {}
    instanceData[formID] = this
  }

  registerFormControl(controls, field) {
    //const controlID = this.lastID.match(/frmb-\d{13}/)[0]
    const controlClass = controls.getClass(field.type)
    const instData = controlClass.instanceData(field)
    this.registeredControls[instData.name] = instData
    return instData
  }
}

export const availablefields = {}
