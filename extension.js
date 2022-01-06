/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'vmnas-extension';

const { GObject, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;

let NASmounted = false;
let VMrunning  = false;
const VMname = "RDPWindows";
const NASmountpoint = "/media/antonio/NAS";

const NASindicator = GObject.registerClass(
class NASindicator extends PanelMenu.Button {
    _init() {
        log('[vmnas-extension] init');
        super._init(0.0, _('NASindicator'));

        this.add_child(new St.Icon({
            icon_name: 'folder-remote-symbolic',
            style_class: 'system-status-icon',
        }));
      
        let item = new PopupMenu.PopupMenuItem(_('Mount NAS'));
        
        item.connect('activate', () => {
            let cmd_mount = 'mount ' + NASmountpoint;
            let cmd_umount = 'umount ' + NASmountpoint;

            try {
                if (NASmounted == false) {
                    // GLib.spawn_command_line_async(cmd_start);
                    GLib.spawn_command_line_async(cmd_mount);
                    NASmounted = true;
                    item.label.set_text("Unmount NAS");
                    log('[vmnas-extension]: mounting NAS');
                    Main.notify(_('NAS mounted!'));
                } else if (NASmounted == true) {
                    GLib.spawn_command_line_async(cmd_umount);
                    NASmounted = false;
                    item.label.set_text("Mount NAS");
                    log('[vmnas-extension]: unmounting NAS');
                    Main.notify(_('NAS unmounted!'));
                }
            } catch (e) {
                log(e);
            }
        });
        this.menu.addMenuItem(item);
    }
});

const VMindicator = GObject.registerClass(
    class VMindicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('VMindicator'));
    
            this.add_child(new St.Icon({style_class: 'vm-icon'}));
    
            let item = new PopupMenu.PopupMenuItem(_('Strat VM'));
            item.connect('activate', () => {
                let cmd_start = 'virsh start ' + VMname;
                let cmd_shut = 'virsh shutdown ' + VMname;
    
                try {
                    if (VMrunning == false) {
                        GLib.spawn_command_line_async(cmd_start);
                        VMrunning = true;
                        item.label.set_text("Stop VM");
                        log('[vmnas-extension]: starting VM');
                        Main.notify(_('VM started!'));
                    } else if (VMrunning == true) {
                        GLib.spawn_command_line_async(cmd_shut);
                        VMrunning = false;
                        item.label.set_text("Start VM");
                        log('[vmnas-extension]: stopping VM');
                        Main.notify(_('VM shutdown!'));
                    }
                } catch (e) {
                    log(e);
                }
            });
            this.menu.addMenuItem(item);
        }
    });

    

class Extension {
    constructor(uuid) {
        this._uuidNAS = uuid;
        this._uuidVM =  uuid + "unique";

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._NASindicator = new NASindicator();
        Main.panel.addToStatusArea(this._uuidNAS, this._NASindicator);
        this._VMindicator = new VMindicator();
        Main.panel.addToStatusArea(this._uuidVM, this._VMindicator);
    }

    disable() {
        this._NASindicator.destroy();
        this._NASindicator = null;
        this._VMindicator.destroy();
        this._VMindicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
