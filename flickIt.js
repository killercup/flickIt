/*
  flickIt by Pascal Hertleif
  http://killercup.github.com/flickIt/

  Depends on jQuery or Zepto.

  flickIt is a simple jQuery/Zepto plugin for creating iOS-style flickable galleries on touch-enabled devices.

  Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
*/
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

!(function($) {
  var FlickIt;
  FlickIt = (function() {

    FlickIt.prototype.settings = {
      width: "screen",
      offset: 0,
      enableMouseEvents: true,
      showIndicators: true,
      showButtons: false,
      indicatorClass: "flickableIndicator",
      activeIndicatorClass: "flickableIndicatorActive",
      slideshowNavigationClass: "slideshowNavigation",
      nextButtonClass: "nextSlideButton",
      prevButtonClass: "prevSlideButton",
      nextButtonText: "Next",
      prevButtonText: "Previous"
    };

    FlickIt.prototype.orientationEvent = ("onorientationchange" in window ? "orientationchange" : "resize");

    FlickIt.prototype.orientationTimeout = void 0;

    function FlickIt(container, options) {
      var _this = this;
      this.container = container;
      this.updateIndicators = __bind(this.updateIndicators, this);
      this.on_start = __bind(this.on_start, this);
      this.settings = $.extend(this.settings, options);
      this.$container = $(this.container);
      this.currentSlide = this.offset = this.settings.offset;
      this.previousSlide = this.currentSlide;
      if (this.settings.subSelector != null) {
        this.$el = this.$container.find(this.settings.subSelector);
        if (this.$el.length) this.el = this.$el[0];
      } else {
        this.el = this.container;
      }
      if (!this.$el.length) return;
      if (this.settings.width === "screen") {
        this.settings.widthScreen = true;
        this.settings.width = window.innerWidth;
        window.addEventListener(this.orientationEvent, function(e) {
          clearTimeout(_this.orientationTimeout);
          return _this.orientationTimeout = setTimeout(function() {
            _this.settings.width = window.innerWidth;
            return _this.$container.css({
              width: _this.settings.width
            });
          }, 200);
        });
      }
      this.$container.css({
        width: this.settings.width
      });
      if ("ontouchstart" in document.createElement("div")) {
        this.events = {
          start: "touchstart",
          move: "touchmove",
          end: "touchend"
        };
      } else if (this.settings.enableMouseEvents) {
        this.events = {
          start: "mousedown",
          move: "mousemove",
          end: "mouseup"
        };
      }
      this.setup();
      this;
    }

    FlickIt.prototype.setup = function() {
      var _this = this;
      if (this.settings.showIndicators) this.createIndicators();
      this.resetWidths();
      $(window).on(this.orientationEvent, function() {
        return setTimeout((function() {
          return _this.resetWidths();
        }), 400);
      });
      /*
              I'm using plain event listeners for touch events.
              That way, I always get the right thing and don't care
              if you are using jQuery or Zepto.
      */
      this.container.addEventListener(this.events.start, this.on_start, false);
      return this.$container.on('append', function(event) {
        _this.resetWidths();
        return _this.createIndicators();
      });
    };

    FlickIt.prototype.enableAnimation = function() {
      this.el.style.WebkitTransition = "-webkit-transform 0.4s ease";
      this.el.style.MozTransition = "-moz-transform 0.4s ease";
      this.el.style.OTransition = "-o-transform 0.4s ease";
      return this.el.style.transition = "transform 0.4s ease";
    };

    FlickIt.prototype.disableAnimation = function() {
      this.el.style.WebkitTransition = "";
      this.el.style.MozTransition = "";
      this.el.style.OTransition = "";
      return this.el.style.transition = "";
    };

    FlickIt.prototype.snapToCurrentSlide = function(showAnimation) {
      var offset;
      if (showAnimation == null) showAnimation = true;
      if (showAnimation) {
        this.enableAnimation();
      } else {
        this.disableAnimation();
      }
      offset = -(this.currentSlide * this.settings.width);
      this.el.style.WebkitTransform = "translate3d(" + offset + "px, 0, 0)";
      this.el.style.MozTransform = "translateX(" + offset + "px)";
      this.el.style.OTransform = "translateX(" + offset + "px)";
      this.el.style.transform = "translate3d(" + offset + "px, 0, 0)";
      this.callCallback();
      return this.$container.trigger('flicked');
    };

    FlickIt.prototype.resetWidths = function() {
      this.subItemCount = this.el.children.length;
      this.snapToCurrentSlide(false);
      this.el.style.width = (this.settings.width * this.subItemCount) + "px";
      return this.$el.children().css({
        width: this.settings.width + "px"
      });
    };

    FlickIt.prototype.getXY = function(evt) {
      var i, j, sumX, sumY;
      if (evt.targetTouches && evt.targetTouches.length) {
        i = 0;
        j = evt.targetTouches.length;
        sumX = sumY = 0;
        while (i < j) {
          sumX += evt.targetTouches[i].clientX;
          sumY += evt.targetTouches[i].clientY;
          i++;
        }
        return [sumX / j, sumY / j];
      } else {
        return [evt.clientX, evt.clientY];
      }
    };

    FlickIt.prototype.on_start = function(evt) {
      var current, endEvent, moveEvent, newTime, origin, prevTime, reposition, speed,
        _this = this;
      current = origin = this.getXY(evt);
      newTime = prevTime = (new Date()).getTime();
      speed = 0;
      this.disableAnimation();
      reposition = function(evt) {
        var delta, distanceX, distanceY;
        distanceX = Math.abs(current[0] - origin[0]);
        distanceY = Math.abs(current[1] - origin[1]);
        newTime = (new Date()).getTime();
        prevTime = newTime;
        if (!(distanceX > distanceY)) current[0] = origin[0];
        speed = (current[0] - origin[0]) / (newTime - prevTime);
        delta = current[0] - origin[0];
        if (_this.offset + delta > 0 || _this.offset + delta < -((_this.subItemCount - 1) * _this.settings.width)) {
          delta = Math.floor(delta / 2);
        }
        _this.el.style.WebkitTransform = "translate3d(" + (_this.offset + delta) + "px, 0, 0)";
        _this.el.style.MozTransform = "translateX(" + (_this.offset + delta) + "px)";
        _this.el.style.OTransform = "translateX(" + (_this.offset + delta) + "px)";
        return _this.el.style.transform = "translate3d(" + (_this.offset + delta) + "px, 0, 0)";
      };
      moveEvent = function(evt) {
        current = _this.getXY(evt);
        return reposition(evt);
      };
      endEvent = function(evt) {
        var diff;
        diff = current[0] - origin[0] + ((speed / _this.settings.width) * 12000);
        if (diff > _this.settings.width / 2 && _this.offset !== 0) {
          current[0] = origin[0] + _this.settings.width;
          _this.offset = _this.offset + _this.settings.width;
        } else if (diff < -(_this.settings.width / 2) && _this.offset !== -((_this.subItemCount - 1) * _this.settings.width)) {
          current[0] = origin[0] - _this.settings.width;
          _this.offset = _this.offset - _this.settings.width;
        } else {
          current[0] = origin[0];
        }
        _this.currentSlide = Math.floor(Math.abs(_this.offset / _this.settings.width));
        _this.snapToCurrentSlide(true);
        _this.container.removeEventListener(_this.events.move, moveEvent, false);
        return _this.container.removeEventListener(_this.events.end, endEvent, false);
      };
      this.container.addEventListener(this.events.move, moveEvent, false);
      return this.container.addEventListener(this.events.end, endEvent, false);
    };

    FlickIt.prototype.createIndicators = function() {
      var _this = this;
      if (this.indicator != null) {
        this.indicator.empty();
      } else {
        this.indicator = $("<div class='" + this.settings.indicatorClass + "'/>");
        this.$el.after(this.indicator);
        this.$container.on('flicked', this.updateIndicators);
      }
      this.$el.children().each(function(index, element) {
        var span;
        span = $('<span/>');
        if (index === _this.offset) {
          span.addClass(_this.settings.activeIndicatorClass);
        }
        _this.indicator.append(span);
        return _this;
      });
      return this.indicator;
    };

    FlickIt.prototype.updateIndicators = function(event) {
      return this.indicator.children().eq(this.currentSlide).addClass(this.settings.activeIndicatorClass).siblings().removeClass(this.settings.activeIndicatorClass);
    };

    FlickIt.prototype.createButtons = function(prevCallback, nextCallback) {
      var nextButton, prevButton;
      this.slideshowNavigation = $("<div class='" + this.settings.slideshowNavigationClass + "' />");
      nextButton = $("<a href='#' class='" + this.settings.nextButtonClass + "' />").text(this.settings.nextButtonText).on('click', function(event) {
        event.preventDefault();
        return nextCallback();
      });
      prevButton = $("<a href='#' class='" + this.settings.prevButtonClass + "' />").text(this.settings.prevButtonText).on('click', function(event) {
        event.preventDefault();
        return prevCallback();
      });
      this.slideshowNavigation.append(prevButton);
      this.slideshowNavigation.append(nextButton);
      return this.slideshowNavigation;
    };

    FlickIt.prototype.callCallback = function() {
      var _this = this;
      if (this.settings.callback) {
        return setTimeout((function() {
          if (_this.currentSlide !== _this.previousSlide) {
            _this.settings.callback.call(_this, _this.currentSlide, _this.$container, _this.$el);
            return _this.previousSlide = _this.currentSlide;
          }
        }), 200);
      }
    };

    return FlickIt;

  })();
  $.fn.flickIt = function(option) {
    this.each(function() {
      var $this, data, options;
      $this = $(this);
      data = $this.data('flickit');
      options = typeof option === "object" && option;
      if (data == null) $this.data("flickit", (data = new FlickIt(this, options)));
      if (typeof option === "string") return data[option]();
    });
    return this;
  };
})(window.jQuery || window.Zepto);
