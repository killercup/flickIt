flickIt
=========

flickIt is a simple jQuery/Zepto plugin for creating iOS-style flickable galleries on touch-enabled devices. It is based on [Flickable](https://github.com/BoostCommunications/Flickable).

Demo
----

A demo of the original project [Flickable](https://github.com/BoostCommunications/Flickable) can be viewed at [flickable.aurlien.net](http://flickable.aurlien.net).

Usage
-----

```html
    <div>
        <ul class="flickable">
            <li>First</li>
            <li>Second</li>
            <li>Third</li>
        </ul>
    </div>
    <script type="text/javascript">
        $('.flickable').flickIt({
            width: 320
        });
    </script>
```

Settings reference
------------------

- `width`: The width of each item, including margin, padding and border. Use 'screen' to auto-fit and resize with screen. **Default:** `'screen'`
- `offset`: Which item to start at. **Default:** `0`
- `enableMouseEvents`: Whether to enable mouse events (useful for testing). **Default:** `false`
- `showIndicators`: Whether to show indicators for which item is selected. **Default:** `true`
- `showButtons`: Whether to show next/previous-buttons for devices that support touch events. **Default:** `false`
- `nextButtonText`: Text for next-button. **Default:** `'Next'`
- `prevButtonText`: Text for previous-button. **Default:** `'Previous'`
- `indicatorClass`: The class name for the indicator wrapper element. **Default:** `'flickableIndicator'`
- `activeIndicatorClass`: The class name for the active indicator element. **Default:** `'flickableIndicatorActive'`
- `callback`: A function to be called each time the slide changes. The function will be passed the slide number (zero-indexed) as a parameter.

_Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php_
