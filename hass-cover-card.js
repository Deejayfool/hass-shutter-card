class CustomCoverCard extends HTMLElement {
  set hass(hass) {
    const _this = this;
    const entities = this.config.entities;
    
    //Init the card
    if (!this.card) {
      const card = document.createElement('ha-card');
      card.header = 'Cover card';
      this.card = card;
      this.appendChild(card);
    
      let allCovers = document.createElement('div');
      allCovers.className = 'cc-covers';
      entities.forEach(function(entityId) {
        let cover = document.createElement('div');

        cover.className = 'cc-cover';
        cover.dataset.cover = entityId;
        cover.innerHTML = `
          <div class="cc-cover-label">
            
          </div>
          <div class="cc-cover-state">
            
          </div>
          <div class="cc-cover-position">
            
          </div>
          <div class="cc-cover-selector">
            <div class="cc-cover-selector-picture">
              <div class="cc-cover-selector-slide"></div>
              <div class="cc-cover-selector-picker"></div>
            </div>
          </div>
          <div class="cc-cover-buttons">
            <ha-icon-button icon="mdi:arrow-up" class="cc-cover-button" data-command="up"></ha-icon-button>
            <ha-icon-button icon="mdi:stop" class="cc-cover-button" data-command="stop"></ha-icon-button>
            <ha-icon-button icon="mdi:arrow-down" class="cc-cover-button" data-command="down"></ha-icon-button>
          </div>
        `;
        
        let picture = cover.querySelector('.cc-cover-selector-picture');
        let slide = cover.querySelector('.cc-cover-selector-slide');
        let picker = cover.querySelector('.cc-cover-selector-picker');
        
        let mouseDown = function(event) {
          if (event.cancelable) {
            //Disable default drag event
            event.preventDefault();
          }
            
          document.addEventListener('mousemove', mouseMove);
          document.addEventListener('touchmove', mouseMove);
          document.addEventListener('pointermove', mouseMove);
      
          document.addEventListener('mouseup', mouseUp);
          document.addEventListener('touchend', mouseUp);
          document.addEventListener('pointerup', mouseUp);
        };
  
        let mouseMove = function(event) {
          let newPosition = event.pageY - _this.getPictureTop(picture);
          _this.setPickerPosition(newPosition, picker, slide);
        };
           
        let mouseUp = function(event) {
          let newPosition = event.pageY - _this.getPictureTop(picture);
          
          if (newPosition < _this.minPosition)
            newPosition = _this.minPosition;
          
          if (newPosition > _this.maxPosition)
            newPosition = _this.maxPosition;
          
          let percentagePosition = (newPosition - _this.minPosition) * 100 / (_this.maxPosition - _this.minPosition);
          
          _this.updateCoverPosition(entityId, 100 - percentagePosition);
          
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('touchmove', mouseMove);
          document.removeEventListener('pointermove', mouseMove);
      
          document.removeEventListener('mouseup', mouseUp);
          document.removeEventListener('touchend', mouseUp);
          document.removeEventListener('pointerup', mouseUp);
        };
      
        //Manage slider update
        picker.addEventListener('mousedown', mouseDown);
        picker.addEventListener('touchstart', mouseDown);
        picker.addEventListener('pointerdown', mouseDown);
        
        //Manage click on buttons
        cover.querySelectorAll('.cc-cover-button').forEach(function (button) {
            button.onclick = function () {
                const command = this.dataset.command;
                
                let service = '';
                
                switch (command) {
                  case 'up':
                      service = 'open_cover';
                      break;
                      
                  case 'down':
                      service = 'close_cover';
                      break;
                
                  case 'stop':
                      service = 'stop_cover';
                      break;
                }
                
                hass.callService('cover', service, {
                  entity_id: entityId
                });
            };
        });
      
        allCovers.appendChild(cover);
      });
      
      
      const style = document.createElement('style');
      style.textContent = `
        .cc-covers { padding: 16px; }
        .cc-cover-selector-picture { position: relative; background-image: url('/local/images/youtube.png'); background-size: cover; min-height: 150px; max-height: 100%; width: 145px; }
        .cc-cover-selector-slide { position: absolute; top: 31px; left: 15px; width: 80%; height: 0; background-color: white; }
        .cc-cover-selector-picker { position: absolute; top: 31px; left: 15px; width: 80%; cursor: pointer; height: 10px; background-color: grey; }
      `;
    
      this.card.appendChild(allCovers);
      this.appendChild(style);
    }
    
    //Update the covers UI
    entities.forEach(function(entityId) {
      const cover = _this.card.querySelector('div[data-cover="' + entityId +'"]');
      const slide = cover.querySelector('.cc-cover-selector-slide');
      const picker = cover.querySelector('.cc-cover-selector-picker');
        
      const state = hass.states[entityId];
      const stateStr = state ? state.state : 'unavailable';
      const friendlyName = state ? state.attributes.friendly_name : 'unknown';
      const currentPosition = state ? state.attributes.current_position : 'unknown';
      
      cover.querySelector('.cc-cover-label').innerHTML = friendlyName;
      cover.querySelector('.cc-cover-state').innerHTML = stateStr;
      cover.querySelector('.cc-cover-position').innerHTML = currentPosition + '%';
      _this.setPickerPositionPercentage(100 - currentPosition, picker, slide);
    });
  }
  
  getPictureTop(picture) {
      let pictureBox = picture.getBoundingClientRect();
      let body = document.body;
      let docEl = document.documentElement;

      let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;

      let clientTop = docEl.clientTop || body.clientTop || 0;

      let pictureTop  = pictureBox.top + scrollTop - clientTop;
      
      return pictureTop;
  }
  
  setPickerPositionPercentage(position, picker, slide) {
    let realPosition = (this.maxPosition - this.minPosition) * position / 100 + this.minPosition;
  
    this.setPickerPosition(realPosition, picker, slide);
  }
  
  setPickerPosition(position, picker, slide) {
    if (position < this.minPosition)
      position = this.minPosition;
  
    if (position > this.maxPosition)
      position = this.maxPosition;
  
    picker.style.top = position + 'px';
    slide.style.height = position - this.minPosition + 'px';
  }
  
  updateCoverPosition(entityId, position) {
    let coverPosition = Math.round(position);
  
    hass.callService('cover', 'set_cover_position', {
      entity_id: entityId,
      position: coverPosition
    });
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define entities');
    }
    this.config = config;
    this.maxPosition = 140;
    this.minPosition = 31;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return this.config.entities.length + 1;
  }
}

customElements.define("custom-cover-card", CustomCoverCard);