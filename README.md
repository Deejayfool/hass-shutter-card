# Cover card

This card allows to open, close or set a cover to the opening rate you want.

## Overview



## Configuration


## Install

If you use HACS, the resources will automatically be configured with the needed file.

If you don't use HACS, you can download js file from [latest releases](https://github.com/Deejayfool/hass-cover-card/releases). Drop it then in `www` folder in your `config` directory. Next add the following entry in lovelace configuration:

```yaml
resources:
  - url: /local/hass-cover-card.js
    type: module
```