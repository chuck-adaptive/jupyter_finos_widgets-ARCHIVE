// Copyright (c) Adaptive
// Distributed under the terms of the Modified BSD License.
import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import * as fdc3 from '@finos/fdc3';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';

export class ExampleModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ExampleModel.model_name,
      _model_module: ExampleModel.model_module,
      _model_module_version: ExampleModel.model_module_version,
      _view_name: ExampleModel.view_name,
      _view_module: ExampleModel.view_module,
      _view_module_version: ExampleModel.view_module_version,
      fdc3Info: {}
    };
  }

  async initialize(attr: any, opts: any) {
    super.initialize(attr, opts);
    await fdc3.fdc3Ready();
    const info = await fdc3.getInfo();
    this.set('fdc3Info', info);
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'ExampleModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ExampleView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class ExampleView extends DOMWidgetView {

  render() {
    this.value_changed();
    this.model.on('change:fdc3Info', this.value_changed, this);
  }

   value_changed() {
     const { fdc3Version } = this.model.get('fdc3Info');
     this.el.textContent = `FDC3 Version: ${fdc3Version}`;
  }

}

export class ChannelModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ChannelModel.model_name,
      _model_module: ChannelModel.model_module,
      _model_module_version: ChannelModel.model_module_version,
      _view_name: ChannelModel.view_name,
      _view_module: ChannelModel.view_module,
      _view_module_version: ChannelModel.view_module_version,
      systemChannels: [],
      channelId: null
    }
  }

  async initialize(attr: any, opts: any) {
    super.initialize(attr, opts);
    await fdc3.fdc3Ready();
    const chan = await fdc3.getCurrentChannel();
    this.set('channelId', chan?.id);
    this.set('systemChannels', await fdc3.getSystemChannels());
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'ChannelModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ChannelView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class ChannelView extends DOMWidgetView {
  render() {
    const channelList = document.createElement("ul");
    channelList.classList.add('channel-list');

    this.el.append(channelList);

    this.channelListUpdated();
    this.model.on('change:channelId', this.channelIdUpdated, this);
    this.model.on('change:systemChannels', this.channelListUpdated, this);
  }

  channelListUpdated() {
    const channelList: any = this.el.querySelector('.channel-list');
    const channels = this.model.get('systemChannels');
    const channelId = this.model.get('channelId');

    channelList?.replaceChildren(...channels.map((chan: any) => {
      const { color, name } = chan.displayMetadata;
      const channelButton = document.createElement('button');

      channelButton.classList.add(`channel-button-${chan.id}`);
      channelButton.style.backgroundColor = color;
      channelButton.textContent = name;
      channelButton.addEventListener('click', async () => {
        await fdc3.joinChannel(chan.id);
        this.model.set('channelId', chan.id);
      });

      if (chan.id === channelId) {
        channelButton.disabled = true;
        channelButton.classList.add('disabled');
      }

      return channelButton;
    }));

    const leaveButton = document.createElement('button');
    leaveButton.textContent = 'Leave';
    leaveButton.classList.add('leave-button');
    leaveButton.addEventListener('click', async () => {
      await fdc3.leaveCurrentChannel();
      this.model.set('channelId', null);
    });

    if (!channelId) {
      leaveButton.disabled = true;
    }

    channelList.appendChild(leaveButton);
  }

  channelIdUpdated() {
    const id = this.model.get('channelId');

    let button: any = this.el.querySelector('button.disabled');
    if (button) {
      button.classList.remove('disabled');
      button.disabled = false;
    }

    const leaveButton: any = this.el.querySelector('.leave-button');
    if (id) {
      button = this.el.querySelector(`.channel-button-${id}`);
      if (button) {
        button.classList.add('disabled');
        button.disabled = true;
      }
      leaveButton.disabled = false;
    } else {
      leaveButton.disabled = true;
    }
    
  }
}

