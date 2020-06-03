class CustomCoverCard extends HTMLElement {
    set hass(hass) {
      const entities = this.config.entities;
      const style = document.createElement('style');
      const _this = this;
      style.textContent = `
        .cc-covers { padding: 16px; }
      `;
      
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
            <div class="cc-cover-positionselector">
              ADD HERE A VISUAL POSITION SELECTOR
            </div>
            <div class="cc-cover-buttons">
              <ha-icon-button icon="mdi:arrow-up" class="cc-cover-button" data-command="up"></ha-icon-button>
              <ha-icon-button icon="mdi:stop" class="cc-cover-button" data-command="stop"></ha-icon-button>
              <ha-icon-button icon="mdi:arrow-down" class="cc-cover-button" data-command="down"></ha-icon-button>
            </div>
          `;
        
          cover.querySelectorAll('.cc-cover-button').forEach(function (button) {
              button.onclick = function () {
                  const command = this.dataset.command;
                  console.log(command + ' for cover ' + entityId);
                  
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
      
        this.card.appendChild(allCovers);
        this.appendChild(style);
      }
      
      //Update the covers UI
      entities.forEach(function(entityId) {
        const cover = _this.card.querySelector('div[data-cover="' + entityId +'"]');
          
        const state = hass.states[entityId];
        const stateStr = state ? state.state : 'unavailable';
        const friendlyName = state ? state.attributes.friendly_name : 'unknown';
        
        cover.querySelector('.cc-cover-label').innerHTML = friendlyName;
        cover.querySelector('.cc-cover-state').innerHTML = stateStr;
      });
    }
  
    setConfig(config) {
      if (!config.entities) {
        throw new Error('You need to define entities');
      }
      this.config = config;
    }
  
    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
      return this.config.entities.length + 1;
    }
  }
  
  customElements.define("custom-cover-card", CustomCoverCard);