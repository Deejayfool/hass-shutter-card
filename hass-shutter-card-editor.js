import { localize } from './localize.js';

const LitElement = customElements.get("hui-masonry-view")
  ? Object.getPrototypeOf(customElements.get("hui-masonry-view"))
  : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

// See : https://github-wiki-see.page/m/thomasloven/hass-config/wiki/PreLoading-Lovelace-Elements
// Preloading the entities card in order to have access to hui-entities-card-row-editor
// First we get an entities card element
const cardHelpers = await window.loadCardHelpers();
const entitiesCard = await cardHelpers.createCardElement({type: "entities", entities: []}); // A valid config avoids errors
// Then we make it load its editor through the static getConfigElement method
entitiesCard.constructor.getConfigElement();
// Then we get the editor
const huiEntitiesCardRowEditor = window.customElements.get("hui-entities-card-row-editor");

class ShutterCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: { state: true },
      _configEntities: { state: true },
      _subElementEditorConfig: { state: true },
    }
  }

  setConfig(config) {
    this._config = config;
    this._configEntities = this.processEditorEntities(config.entities);
  }

  get _title() {
    return this._config?.title || '';
  }
 
  render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    if (this._subElementEditorConfig) {
      return html`
        <shutter-card-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig.elementConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        >
        </shutter-card-sub-element-editor>
      `;
    }

    return html`
    <div class="card-config">
      <ha-textfield
        .label=${localize("hcs.editor.title", this.hass.locale)}
        .hass=${this.hass}
        .value=${this._title}
        .configValue=${'title'}
        @input=${this._valueChanged}
        style='display: flex'
      ></ha-textfield>
      <hui-entities-card-row-editor
        .hass=${this.hass}
        .entities=${this._configEntities}
        @entities-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></hui-entities-card-row-editor>
    </div>
    `;
  }

  static get styles() {
    return css`
      /* Styles pour la carte */
    `;
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    const configValue =
      target.configValue || this._subElementEditorConfig?.type;
    const value =
      target.checked !== undefined
        ? target.checked
        : target.value || ev.detail.config || ev.detail.value;

    if (configValue === "title" && target.value === this._title) {
      return;
    }

    if (configValue === "row" || (ev.detail && ev.detail.entities)) {
      const newConfigEntities =
        ev.detail.entities || this._configEntities.concat();
      if (configValue === "row") {
        if (!value) {
          newConfigEntities.splice(this._subElementEditorConfig.index, 1);
          this._goBack();
        } else {
          newConfigEntities[this._subElementEditorConfig.index] = value;
        }

        this._subElementEditorConfig.elementConfig = value;
      }

      this._config = { ...this._config, entities: newConfigEntities };
      this._configEntities = this.processEditorEntities(this._config.entities);
    } else if (configValue) {
      if (value === "") {
        this._config = { ...this._config };
        delete this._config[configValue];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value,
        };
      }
    }

    fireEvent(this, "config-changed", { config: this._config });
  }

  _handleSubElementChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const configValue = this._subElementEditorConfig.type;
    const value = ev.detail.config;

    if (configValue === "row") {
      const newConfigEntities = this._configEntities.concat();
      if (!value) {
        newConfigEntities.splice(this._subElementEditorConfig.index, 1);
        this._goBack();
      } else {
        newConfigEntities[this._subElementEditorConfig.index] = value;
      }

      this._config = { ...this._config, entities: newConfigEntities };
      this._configEntities = this.processEditorEntities(this._config.entities);
    } else if (configValue) {
      if (value === "") {
        this._config = { ...this._config };
        delete this._config[configValue];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value,
        };
      }
    }

    this._subElementEditorConfig = {
      ...this._subElementEditorConfig,
      elementConfig: value,
    };

    fireEvent(this, "config-changed", { config: this._config });
  }

  processEditorEntities(entities) {
    return entities.map((entityConf) => {
      if (typeof entityConf === "string") {
        return { entity: entityConf };
      }
      return entityConf;
    });
  }

  _editDetailElement(ev){
    this._subElementEditorConfig = ev.detail.subElementConfig;
  }

  _goBack() {
    this._subElementEditorConfig = undefined;
  }

}



class ShutterCardSubElementEditor extends LitElement {

  static get properties() {
    return {
      hass: {},
      config: {},
    }
  }

  get _name() {
    return this.config['name'] || '';
  }
  
  get _buttonsPosition() {
    return this.config['buttons_position'];
  }

  get _titlePosition() {
    return this.config['title_position'];
  }

  get _invertPercentage() {
    return this.config['invert_percentage'];
  }

  get _canTilt() {
    return this.config['can_tilt'];
  }

  get _partialClosePercentage() {
    return this.config['partial_close_percentage'];
  }

  get _offsetClosedPercentage() {
    return this.config['offset_closed_percentage'];
  }

  get _alwaysPercentage() { 
    return this.config['always_percentage'];
  }

  get _shutterWidthPx() {
    return this.config['shutter_width_px'];
  }

  get _disableEndButtons() {
    return this.config['disable_end_buttons'];
  }

  get _partialOpenButtonsDisplayed() {
    return this.config['partial_open_buttons_displayed'];
  }

  get _disableStandardButtons() {
    return this.config['disable_standard_buttons'];
  }
  
  render() {
    return html`
      <div class="header">
        <div class="back-title">
          <ha-icon-button-prev
            .label=${this.hass.localize("ui.common.back")}
            @click=${this._goBack}
          ></ha-icon-button-prev>
          <span slot="title"
            >${this.hass.localize("ui.panel.lovelace.editor.sub-element-editor.types.row")}
          </span>
        </div>
      </div>
      <div class="content">
        <div class="row">
          <ha-textfield 
            .label=${localize("hcs.editor.name", this.hass.locale)}
            .value=${this._name} 
            @change=${this._handleNameChanged}>
          </ha-textfield>
        </div>
        <div class="row">
          <ha-select
            .label=${localize("hcs.editor.buttons_position", this.hass.locale)}
            .value=${this._buttonsPosition}
            @selected=${this._buttonsPositionSelected}
            @closed=${this._stopPropagation}
            fixedMenuPosition
            naturalMenuWidth
            >
            <ha-list-item value="left">${localize("hcs.editor.position.left", this.hass.locale)}</ha-list-item>
            <ha-list-item value="right">${localize("hcs.editor.position.right", this.hass.locale)}</ha-list-item>
            <ha-list-item value="top">${localize("hcs.editor.position.top", this.hass.locale)}</ha-list-item>
            <ha-list-item value="bottom">${localize("hcs.editor.position.bottom", this.hass.locale)}</ha-list-item>
          </ha-select>
          <ha-select
            .label=${localize("hcs.editor.title_position", this.hass.locale)}
            .value=${this._titlePosition}
            @selected=${this._titlePositionSelected}
            @closed=${this._stopPropagation}
            fixedMenuPosition
            naturalMenuWidth
            >
            <ha-list-item value="top">${localize("hcs.editor.position.top", this.hass.locale)}</ha-list-item>
            <ha-list-item value="bottom">${localize("hcs.editor.position.bottom", this.hass.locale)}</ha-list-item>
          </ha-select>
        </div>
        <div class="row">
          <ha-formfield
                id="disable-standard-buttons"
                .label=${localize("hcs.editor.disable_standard_buttons", this.hass.locale)}
              >
                <ha-switch
                  .checked=${this._disableStandardButtons}
                  @change=${this._disableStandardButtonsChanged}
                >
                </ha-switch>
          </ha-formfield>
          <ha-formfield
                id="disable-end-buttons"
                .label=${localize("hcs.editor.disable_end_buttons", this.hass.locale)}
              >
                <ha-switch
                  .checked=${this._disableEndButtons}
                  @change=${this._disableEndButtonsChanged}
                >
                </ha-switch>
          </ha-formfield>
        </div>
        <simple-tooltip animation-delay="0" for="disable-standard-buttons">
          ${localize("hcs.editor.tooltip.disable_standard_buttons", this.hass.locale)}
        </simple-tooltip>
        <simple-tooltip animation-delay="0" for="disable-end-buttons">
          ${localize("hcs.editor.tooltip.disable_end_buttons", this.hass.locale)}
        </simple-tooltip>
        <div class="row">
          <ha-formfield
                .label=${localize("hcs.editor.partial_open_buttons_displayed", this.hass.locale)}
              >
                <ha-switch
                  .checked=${this._partialOpenButtonsDisplayed}
                  @change=${this._partialOpenButtonsDisplayedChanged}
                >
                </ha-switch>
          </ha-formfield>
          <ha-formfield
                id="inverted-shutter"
                .label=${localize("hcs.editor.inverted_shutter", this.hass.locale)}
              >
                <ha-switch
                  .checked=${this._invertPercentage}
                  @change=${this._invertPercentageChanged}
                >
                </ha-switch>
          </ha-formfield>
        </div>
        <simple-tooltip animation-delay="0" for="inverted-shutter">
          ${localize("hcs.editor.tooltip.inverted_shutter", this.hass.locale)}
        </simple-tooltip>
        <div class="row">
          <ha-formfield
                id="always-percentage"
                .label=${localize("hcs.editor.always_percentage", this.hass.locale)}
              >
                <ha-switch
                  .checked=${this._alwaysPercentage}
                  @change=${this._alwaysPercentageChanged}
                >
                </ha-switch>
          </ha-formfield>
          <ha-formfield
                .label=${localize("hcs.editor.can_tilt", this.hass.locale)}
              >
                <ha-switch
                  .checked=${this._canTilt}
                  @change=${this._canTiltChanged}
                >
                </ha-switch>
          </ha-formfield>
        </div>
        <simple-tooltip animation-delay="0" for="always-percentage">
          ${localize("hcs.editor.tooltip.always_percentage", this.hass.locale)}
        </simple-tooltip>
        <div class="row">
          <ha-textfield 
            id="partial-close-percentage"
            .label=${localize("hcs.editor.partial_close_percentage", this.hass.locale)}
            pattern="[0-9]+"
            step=1
            min=0
            max=100
            .value=${this._partialClosePercentage}
            suffix="%"
            type="number"
            @change=${this._partialClosePercentageChanged}
            class="sc-editor-partial-close-percentage">
          </ha-textfield>
          <ha-textfield 
            id="offset-closed-percentage"
            .label=${localize("hcs.editor.offset_closed_percentage", this.hass.locale)}
            pattern="[0-9]+"
            step=1
            min=0
            max=100
            .value=${this._offsetClosedPercentage}
            suffix="%"
            type="number"
            @change=${this._offsetClosedPercentageChanged}
            class="sc-editor-offset-closed-percentage">
          </ha-textfield>
        </div>
        <simple-tooltip animation-delay="0" for="partial-close-percentage">
          ${localize("hcs.editor.tooltip.partial_close_percentage", this.hass.locale)}
        </simple-tooltip>
        <simple-tooltip animation-delay="0" for="offset-closed-percentage">
          ${localize("hcs.editor.tooltip.offset_closed_percentage", this.hass.locale)}
        </simple-tooltip>
        <div class="row">
          <ha-textfield 
            .label=${localize("hcs.editor.shutter_width", this.hass.locale)}
            pattern="[0-9]+"
            step=1
            min=50
            max=300
            .value=${this._shutterWidthPx}
            suffix="px"
            type="number"
            @change=${this._shutterWidthPxChanged}
            class="sc-editor-shutter-width">
          </ha-textfield>
        </div>
      </div>
    `;
  }

  _goBack() {
    fireEvent(this, "go-back");
  }

  _stopPropagation(ev) {
    ev.stopPropagation();
  }

  _fireEventConfigChange(configKey, configValue) {
    let updatedConfig = { ...this.config };
    updatedConfig[configKey] = configValue;
    fireEvent(this, "config-changed", { config: updatedConfig });
  }

  _handleNameChanged(ev) {
    this._fireEventConfigChange("name", ev.target.value);
  }

  _buttonsPositionSelected(ev) {
    this._fireEventConfigChange("buttons_position", ev.target.value);
  }

  _titlePositionSelected(ev) {
    this._fireEventConfigChange("title_position", ev.target.value);
  }

  _invertPercentageChanged(ev) {
    this._fireEventConfigChange("invert_percentage", ev.target.checked);
  }

  _canTiltChanged(ev) {
    this._fireEventConfigChange("can_tilt", ev.target.checked);
  }

  _partialClosePercentageChanged(ev) {
    this._fireEventConfigChange("partial_close_percentage", ev.target.value);
  }

  _offsetClosedPercentageChanged(ev) {
    this._fireEventConfigChange("offset_closed_percentage", ev.target.value);
  }
  
  _alwaysPercentageChanged(ev) {
    this._fireEventConfigChange("always_percentage", ev.target.checked);
  }

  _shutterWidthPxChanged(ev) {
    this._fireEventConfigChange("shutter_width_px", ev.target.value);
  }

  _disableEndButtonsChanged(ev) {
    this._fireEventConfigChange("disable_end_buttons", ev.target.checked);
  }

  _partialOpenButtonsDisplayedChanged(ev) {
    this._fireEventConfigChange("partial_open_buttons_displayed", ev.target.checked);
  }

  _disableStandardButtonsChanged(ev) {
    this._fireEventConfigChange("disable_standard_buttons", ev.target.checked);
  }

  static get styles() {
    return css`
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .back-title {
        display: flex;
        align-items: center;
        font-size: 18px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .row ha-formfield {
        margin: 10px 0;
      }
      .sc-editor-shutter-width,
      .sc-editor-offset-closed-percentage,
      .sc-editor-partial-close-percentage {
        width: 150px;
      }
    `;
  }
}

customElements.define("shutter-card-sub-element-editor", ShutterCardSubElementEditor)
customElements.define("shutter-card-editor", ShutterCardEditor);
