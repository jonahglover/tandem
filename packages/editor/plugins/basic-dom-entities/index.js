import {
  ApplicationPlugin,
  EntityPlugin,
  EntityPaneComponentPlugin,
  EntityLayerLabelComponentPlugin,
  Plugin,
  KeyCommandPlugin
} from 'editor/plugin/types';

import { CallbackNotifier } from 'common/notifiers';
import { TextEntity, ElementEntity } from './entities';
import TransformPaneComponent from './components/entity-panes/transform';
import TypographyPaneComponent from './components/entity-panes/typography';
import AppearancePaneComponent from './components/entity-panes/appearance';
import TextLayerLabelComponent from './components/entity-layer-labels/text';

export default ApplicationPlugin.create({
  id: 'basicDOMEntities',
  factory: {
    create({ app }) {
      registerEntities(app);
      registerCommands(app);
    }
  }
});


function registerEntities(app) {
  app.plugins.push(

    // text
    EntityPlugin.create({
      id      : 'textEntity',
      factory : TextEntity
    }),
    EntityPaneComponentPlugin.create({
      id             : 'transformPaneComponent',
      label          : 'Transform',
      paneType       : 'entity',
      componentClass : TransformPaneComponent
    }),
    EntityPaneComponentPlugin.create({
      id             : 'typographyPaneComponent',
      label          : 'Typography',
      paneType       : 'entity',
      componentClass : TypographyPaneComponent
    }),
    EntityPaneComponentPlugin.create({
      id             : 'appearancePaneComponent',
      label          : 'Appearance',
      paneType       : 'entity',
      componentClass : AppearancePaneComponent
    }),
    EntityLayerLabelComponentPlugin.create({
      id             : 'textPaneLayerComponent',
      layerType      : 'text',
      componentClass : TextLayerLabelComponent
    }),

    // element
    EntityPlugin.create({
      id      : 'elementEntity',
      factory : ElementEntity
    })
  );
}

function registerCommands(app) {
  app.plugins.push(

    // generic
    // TODO - move this to its own plugin
    KeyCommandPlugin.create({
      id         : 'boldCommand',
      keyCommand : 'backspace',
      notifier   : CallbackNotifier.create(function() {
        if (!app.focus || !app.focus.componentType || !app.focus.parent) return;

        // FIXME: leaky here. should be able to remove entity
        // without it being unfocused
        var focus = app.focus;
        var focusIndex = focus.parent.children.indexOf(focus);

        // shift to the previous or next child
        // TODO - no children? move cursor up to the parent
        app.setFocus(focusIndex ? focus.parent.children[focusIndex - 1] : focus.parent.children[focusIndex + 1]);

        // remove the child deleted
        focus.parent.children.remove(focus);
      })
    }),


    // text
    KeyCommandPlugin.create({
      id         : 'boldCommand',
      keyCommand : 'command+b',
      notifier   : createStyleToggler(app, 'fontWeight', 'bold', 'normal')
    }),
    KeyCommandPlugin.create({
      id         : 'italicCommand',
      keyCommand : 'command+i',
      notifier   : createStyleToggler(app, 'fontStyle', 'italic', 'normal')
    }),
    KeyCommandPlugin.create({
      id         : 'underlineCommand',
      keyCommand : 'command+u',
      notifier   : createStyleToggler(app, 'textDecoration', 'underline', 'none')
    })
  );
}

function createStyleToggler(app, name, onValue, offValue) {
  return CallbackNotifier.create(function(message) {
    if (!app.focus || app.focus.componentType !== 'text') return;
    app.focus.setStyle({
      [name]: app.focus.getStyle()[name] === onValue ? offValue : onValue
    });
  })
}
