
import controlText from '../control/text'

// configure the class for runtime loading
if (!window.fbControls) window.fbControls = []
window.fbControls.push(function(controlClass) {
  /**
   * Star rating class
   */
  class bcControlText extends controlText {
    /**
     * Class configuration - return the icons & label related to this control
     * @returndefinition object
     */
     static get definition() {
        return {
          // mi18n custom mappings (defaults to camelCase type)
          icon: '🔤',
          i18n: {
            default: 'Conditional Text',
          },
      }
    }

    static fieldTypes = () => { /*type included just to match signature of parent (control.js) */
      return super.fieldTypes('text')
    }


    /**
     * javascript & css to load
     */
    configure() {

    //  this.js = '//cdnjs.cloudflare.com/ajax/libs/rateYo/2.3.2/jquery.rateyo.min.js'
      //this.js = '//cdnjs.cloudflare.com/ajax/libs/rateYo/2.2.0/jquery.rateyo.min.js'
    //  this.css = '//cdnjs.cloudflare.com/ajax/libs/rateYo/2.3.2/jquery.rateyo.min.css'
      //this.css = '//cdnjs.cloudflare.com/ajax/libs/rateYo/2.2.0/jquery.rateyo.min.css'
    }

    /**
     * build a text DOM element, supporting other jquery text form-control's
     * @return {Object} DOM Element to be injected into the form.
     */
    build() {
      return super.build()
    }

    /**
     * onRender callback
     */
    onRender() {
      super.onRender()
      // Set userData if available
      //if (this.config.userData) {
      //  $(this.dom).val(this.config.userData[0])
      //}
    }
  }

  // register this control for the following types & text subtypes
  controlClass.register('bcText', bcControlText)
  return bcControlText
})

