
/* Native JavaScript for Bootstrap 4 | ScrollSpy
------------------------------------------------ */
import { hasClass } from 'shorter-js/src/class/hasClass.js';
import { addClass } from 'shorter-js/src/class/addClass.js';
import { removeClass } from 'shorter-js/src/class/removeClass.js';
import { on } from 'shorter-js/src/event/on.js';
import { off } from 'shorter-js/src/event/off.js';
import { passiveHandler } from 'shorter-js/src/misc/passiveHandler.js';
import { queryElement } from 'shorter-js/src/misc/queryElement.js';

import { bootstrapCustomEvent, dispatchCustomEvent } from '../util/event.js';
import { componentInit, getScroll } from '../util/misc.js';

// SCROLLSPY DEFINITION
// ====================

export default function ScrollSpy(element,options) {

  // set options
  options = options || {};

  // bind
  let self = this,

    // internals
    vars,

    // DATA API
    targetData,
    offsetData,
    // targets
    spyTarget,
    // determine which is the real scrollTarget
    scrollTarget;

  // private methods
  // populate items and targets
  function updateTargets(){
    const links = spyTarget.getElementsByTagName('A');
    if (vars.length !== links.length) {
      // reset arrays
      vars.items = [];
      vars.targets = [];

      Array.from(links).map(link=>{
        const href = link.getAttribute('href'),
          targetItem = href && href.charAt(0) === '#' && href.slice(-1) !== '#' && queryElement(href);
        if ( targetItem ) {
          vars.items.push(link);
          vars.targets.push(targetItem);
        }
      })
      vars.length = links.length
    }
  }

  // item update
  function updateItem(index) {
    const item = vars.items[index], // the menu item targets this element
      targetItem = vars.targets[index],
      // parent = hasClass(item,'dropdown-item') ? item.closest('.dropdown-menu')  // child looking up
      //        : hasClass(item,'nav-link')      ? item.closest('.nav') : 0,
      dropmenu = hasClass(item,'dropdown-item') && item.closest('.dropdown-menu'),
      dropLink = dropmenu && dropmenu.previousElementSibling,
      // parentLink = parent && parent.previousElementSibling,
      nextSibling = item.nextElementSibling,
      activeSibling = nextSibling && nextSibling.getElementsByClassName('active').length, // parent looking down
      targetRect = vars.isWindow && targetItem.getBoundingClientRect(),
      isActive = hasClass(item,'active') || false,
      topEdge = (vars.isWindow ? targetRect.top + vars.scrollOffset : targetItem.offsetTop) - self.options.offset,
      bottomEdge = vars.isWindow ? targetRect.bottom + vars.scrollOffset - self.options.offset 
                 : vars.targets[index+1] ? vars.targets[index+1].offsetTop - self.options.offset 
                 : element.scrollHeight,
      inside = activeSibling || vars.scrollOffset >= topEdge && bottomEdge > vars.scrollOffset;

     if ( !isActive && inside ) {
      addClass(item,'active');
      if (dropLink && !hasClass(dropLink,'active') ) {
        addClass(dropLink,'active');
      }
      dispatchCustomEvent.call(element, bootstrapCustomEvent( 'activate', 'scrollspy', vars.items[index]));
    } else if ( isActive && !inside ) {
      removeClass(item,'active');

      if (dropLink && hasClass(dropLink,'active') && !item.parentNode.getElementsByClassName('active').length ) {
        removeClass(dropLink,'active');
      }
    } else if ( isActive && inside || !inside && !isActive ) {
      return;
    }
  }
  // update all items
  function updateItems() {
    updateTargets();
    vars.scrollOffset = vars.isWindow ? getScroll().y : element.scrollTop;
    vars.items.map((l,idx)=>updateItem(idx))
  }
  function toggleEvents(action) {
    action( scrollTarget, 'scroll', self.refresh, passiveHandler );
    action( window, 'resize', self.refresh, passiveHandler );
  }

  // public method
  self.refresh = () => {
    updateItems();
  }
  self.dispose = () => {
    toggleEvents(off);
    delete element.ScrollSpy;
  }

  // init
  componentInit(()=>{

    // initialization element, the element we spy on
    element = queryElement(element);

    // reset on re-init
    element.ScrollSpy && element.ScrollSpy.dispose();

    // event targets, constants   
    // DATA API
    targetData = element.getAttribute('data-target')
    offsetData = element.getAttribute('data-offset')
    // targets
    spyTarget = queryElement(options.target || targetData)
    // determine which is the real scrollTarget
    scrollTarget = element.offsetHeight < element.scrollHeight ? element : window

    if (!spyTarget) return

    // set instance options
    self.options = {};
    self.options.target = spyTarget;
    self.options.offset = parseInt(options.offset || offsetData) || 10;

    // set instance priority variables
    vars = {}
    vars.length = 0
    vars.items = []
    vars.targets = []
    vars.isWindow = scrollTarget === window

    // prevent adding event handlers twice
    if ( !element.ScrollSpy ) { 
      toggleEvents(on)
    }
    self.refresh()
  
    // associate target with init object
    self.element = element
    element.ScrollSpy = self
  })

}

