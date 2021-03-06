import * as clampy_ from '@clampy-js/clampy/dist/clampy.umd.js';
// import * as elementResizeDetectorMaker_ from 'element-resize-detector';

// https://github.com/rollup/rollup/issues/670#issuecomment-284621537
const clampy = clampy_.default || clampy_;
// const elementResizeDetectorMaker = (elementResizeDetectorMaker_).default || elementResizeDetectorMaker_;

// const resizeDetector = elementResizeDetectorMaker({ strategy: 'scroll' });
var clampValue;

var _extends = Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

var defaults = {
  clamp: 'auto',
  truncationChar: '…',
  splitOnChars: ['.', '-', '–', '—', ' '],
  useNativeClamp: false
};

export function setDefaults(options) {
  defaults = _extends({}, defaults, options);
}

function setup(el, clampValue) {
  tearDown(el);

  const resizeListener = () => {
    clampElement(el, clampValue);
  };

  el.__VueClampy = {
    clampValue,
    resizeListener
  };

  // Re-clamp on element resize
  // resizeDetector.listenTo(el, () => {
  //   clampElement(el, clampValue);
  // });

  // Also re-clamp on window resize
  window.addEventListener('resize', resizeListener);

  clampElement(el, clampValue);
}

function tearDown(el) {
  if (!el || !el.__VueClampy) return;
  // Remove all listeners
  // resizeDetector.removeAllListeners(el);
  window.removeEventListener('resize', el.__VueClampy.resizeListener);
}

function setInitialContent(el) {
  if (el.clampInitialContent === undefined) {
    el.clampInitialContent = el.innerHTML.trim();
  }
}

function clampElement(el, clamp) {
  // We use element-resize-detector to trigger the ellipsis.
  // Element-resize-detector adds an inner div to monitor
  // it's scroll events.
  // The process of truncating the text for ellipsis removes this div, so we need to remove and readd it
  const scrollNode = el.querySelector('.erd_scroll_detection_container');
  if (scrollNode) {
    el.removeChild(scrollNode);
  }

  setInitialContent(el);

  if (el.clampInitialContent !== undefined) {
    el.innerHTML = el.clampInitialContent;
  }

  defaults = _extends({}, defaults, { clamp: clamp ? clamp : 'auto' });

  // Set the opacity to 0 to avoid content to flick when clamping.
  el.style.opacity = '0';
  const result = clampy.clamp(el, defaults);

  // Set the opacity back to 1 now that the content is clamped.
  el.style.opacity = '1';

  if (scrollNode) {
    el.appendChild(scrollNode);
  }
}

export default {
  inserted(el, binding, vnode) {
    clampValue = binding.value;
    setup(el, clampValue);
  },

  update(el, binding, vnode) {
    clampValue = binding.value;
    setup(el, clampValue);
  },

  unbind(el, binding, vnode) {
    tearDown(el);
    delete el.__VueClampy;
  }
};
