!(($) ->
  class FlickIt
    settings:
      width: "screen"
      offset: 0
      enableMouseEvents: true
      showIndicators: true
      showButtons: false
      indicatorClass: "flickableIndicator"
      activeIndicatorClass: "flickableIndicatorActive"
      slideshowNavigationClass: "slideshowNavigation"
      nextButtonClass: "nextSlideButton"
      prevButtonClass: "prevSlideButton"
      nextButtonText: "Next"
      prevButtonText: "Previous"
    orientationEvent: (if "onorientationchange" of window then "orientationchange" else "resize")
    orientationTimeout: undefined

    constructor: (@container, options) ->
      @settings = $.extend @settings, options
      @$container = $(@container)

      @currentSlide = @offset = @settings.offset
      @previousSlide = @currentSlide

      if @settings.subSelector?
        @$el = @$container.find(@settings.subSelector)
        @el = @$el[0] if @$el.length
      else
        @el = @container

      # do we actually have anything?
      if not @$el.length
        # if not, quit right here
        return

      if @settings.width is "screen"
        @settings.widthScreen = true
        @settings.width = window.innerWidth

        window.addEventListener @orientationEvent, (e) =>
          clearTimeout @orientationTimeout
          @orientationTimeout = setTimeout(=>
            @settings.width = window.innerWidth
            @$container.css width: @settings.width
          , 200)

      @$container.css width: @settings.width

      if "ontouchstart" of document.createElement("div")
        @events =
          start: "touchstart"
          move: "touchmove"
          end: "touchend"
      else if @settings.enableMouseEvents
        @events =
          start: "mousedown"
          move: "mousemove"
          end: "mouseup"

      @setup()
      @

    setup: ->
      @createIndicators() if @settings.showIndicators

      @resetWidths()
      $(window).on @orientationEvent, =>
        setTimeout (=> @resetWidths()), 400

      ###
        I'm using plain event listeners for touch events.
        That way, I always get the right thing and don't care
        if you are using jQuery or Zepto.
      ###
      @container.addEventListener @events.start, @on_start, false

      @$container.on 'append', (event) =>
        @resetWidths()
        @createIndicators()

      # if @settings.showButtons
      # TODO: create buttons

    enableAnimation: ->
      @el.style.WebkitTransition = "-webkit-transform 0.4s ease"
      @el.style.MozTransition = "-moz-transform 0.4s ease"
      @el.style.OTransition = "-o-transform 0.4s ease"
      @el.style.transition = "transform 0.4s ease"

    disableAnimation: ->
      @el.style.WebkitTransition = ""
      @el.style.MozTransition = ""
      @el.style.OTransition = ""
      @el.style.transition = ""

    snapToCurrentSlide: (showAnimation = true) ->
      if showAnimation
        @enableAnimation()
      else
        @disableAnimation()
      offset = -(@currentSlide * @settings.width)

      @el.style.WebkitTransform = "translate3d(" + offset + "px, 0, 0)"
      @el.style.MozTransform = "translateX(" + offset + "px)"
      @el.style.OTransform = "translateX(" + offset + "px)"
      @el.style.transform = "translate3d(" + offset + "px, 0, 0)"

      @callCallback()
      @$container.trigger 'flicked'

    resetWidths: ->
      @subItemCount = @el.children.length
      @snapToCurrentSlide false
      @el.style.width = (@settings.width * @subItemCount) + "px"
      @$el.children().css width: @settings.width + "px"

    getXY: (evt) ->
      if evt.targetTouches and evt.targetTouches.length
        # touch event
        i = 0
        j = evt.targetTouches.length
        sumX = sumY = 0

        while i < j
          sumX += evt.targetTouches[i].clientX
          sumY += evt.targetTouches[i].clientY
          i++
        [sumX / j, sumY / j]
      else
        # mouse event
        [evt.clientX, evt.clientY]

    on_start: (evt) =>
      current = origin = @getXY(evt) # Get origin position
      newTime = prevTime = (new Date()).getTime()
      speed = 0
      @disableAnimation()

      # Reposition gallery based on event
      reposition = (evt) =>
        distanceX = Math.abs(current[0] - origin[0])
        distanceY = Math.abs(current[1] - origin[1])
        newTime = (new Date()).getTime()
        prevTime = newTime

        # Only scroll gallery if X distance is greater than Y distance
        current[0] = origin[0] unless distanceX > distanceY

        speed = (current[0] - origin[0]) / (newTime - prevTime)

        # Get delta X distance
        delta = current[0] - origin[0]

        # Make scrolling "sticky" if we are scrolling past the first or last panel
        if @offset + delta > 0 or @offset + delta < -((@subItemCount - 1) * @settings.width)
          delta = Math.floor(delta / 2)

        # Update position
        @el.style.WebkitTransform = "translate3d(" + (@offset + delta) + "px, 0, 0)"
        @el.style.MozTransform = "translateX(" + (@offset + delta) + "px)"
        @el.style.OTransform = "translateX(" + (@offset + delta) + "px)"
        @el.style.transform = "translate3d(" + (@offset + delta) + "px, 0, 0)"

      moveEvent = (evt) =>
        current = @getXY(evt)
        reposition evt

      endEvent = (evt) =>
        diff = current[0] - origin[0] + ((speed / @settings.width) * 12000)

        # Snap to closest panel
        if diff > @settings.width / 2 and @offset isnt 0
          current[0] = origin[0] + @settings.width
          @offset = @offset + @settings.width
        else if diff < -(@settings.width / 2) and @offset isnt -((@subItemCount - 1) * @settings.width)
          current[0] = origin[0] - @settings.width
          @offset = @offset - @settings.width
        else
          current[0] = origin[0]
        @currentSlide = Math.floor(Math.abs(@offset / @settings.width))
        @snapToCurrentSlide true

        # Remove drag and end event listeners
        @container.removeEventListener @events.move, moveEvent, false
        @container.removeEventListener @events.end, endEvent, false

      # Set up drag and end event listeners
      @container.addEventListener @events.move, moveEvent, false
      @container.addEventListener @events.end, endEvent, false

    createIndicators: ->
      if @indicator?
        # reset the spans
        @indicator.empty()
      else
        # initialize
        @indicator = $("<div class='#{@settings.indicatorClass}'/>")
        @$el.after @indicator
        @$container.on 'flicked', @updateIndicators

      # always add spans
      @$el.children().each (index, element) =>
        span = $('<span/>')
        span.addClass @settings.activeIndicatorClass if index is @offset
        @indicator.append span
        @

      @indicator

    updateIndicators: (event) =>
      @indicator.children().eq(@currentSlide)
        .addClass(@settings.activeIndicatorClass)
        .siblings().removeClass(@settings.activeIndicatorClass)

    createButtons: (prevCallback, nextCallback) ->
      @slideshowNavigation = $("<div class='#{@settings.slideshowNavigationClass}' />")

      nextButton = $("<a href='#' class='#{@settings.nextButtonClass}' />")
        .text(@settings.nextButtonText)
        .on 'click', (event) ->
          event.preventDefault()
          nextCallback()

      prevButton = $("<a href='#' class='#{@settings.prevButtonClass}' />")
        .text(@settings.prevButtonText)
        .on 'click', (event) ->
          event.preventDefault()
          prevCallback()

      @slideshowNavigation.append prevButton
      @slideshowNavigation.append nextButton
      @slideshowNavigation

    callCallback: ->
      if @settings.callback
        setTimeout (=>
          if @currentSlide isnt @previousSlide
            @settings.callback.call @, @currentSlide, @$container, @$el
            @previousSlide = @currentSlide
        ), 200

  $.fn.flickIt = (option) ->
    @each ->
      $this = $(this)
      data = $this.data('flickit')
      options = typeof option is "object" && option

      unless data?
        $this.data "flickit", (data = new FlickIt(this, options))

      if typeof option is "string"
        data[option]()
    return this

  return
)(window.jQuery || window.Zepto)