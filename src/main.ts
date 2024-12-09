/// <reference types="@workadventure/iframe-api-typings" />
import { levelUp } from "@workadventure/quests";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";
console.log('Script started successfully');
// Waiting for the API to be ready
WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ', WA.player.tags);
  // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
  bootstrapExtra().then(() => {
      console.log('Scripting API Extra ready');
  }).catch(e => console.error(e));
}).catch(e => console.error(e));

console.log('Script started successfully');
// Waiting for the API to be ready
WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ',WA.player.tags)
  
  WA.room.area.onEnter("building1-zone").subscribe(() => {
    WA.room.hideLayer("building1-roof");
    WA.room.hideLayer("building1-walls");
    WA.room.hideLayer("building1-sign");
  });
  WA.room.area.onLeave("building1-zone").subscribe(() => {
    WA.room.showLayer("building1-roof");
    WA.room.showLayer("building1-walls");
    WA.room.showLayer("building1-sign");
  });

  WA.room.area.onEnter("building2-zone").subscribe(() => {
    WA.room.hideLayer("building2-roof");
    WA.room.hideLayer("building2-walls");
    WA.room.hideLayer("building2-sign");
  });
  WA.room.area.onLeave("building2-zone").subscribe(() => {
    WA.room.showLayer("building2-roof");
    WA.room.showLayer("building2-walls");
    WA.room.showLayer("building2-sign");
  });

  WA.room.area.onEnter("building2-focus").subscribe(() => {
    WA.room.hideLayer("facade-furniture-bg");
    WA.room.hideLayer("facade-furniture-fg");
    WA.room.hideLayer("facade");
  });
  WA.room.area.onLeave("building2-focus").subscribe(() => {
    WA.room.showLayer("facade-furniture-bg");
    WA.room.showLayer("facade-furniture-fg");
    WA.room.showLayer("facade");
  });
}).catch(e => console.error(e));

//// Focus Timer related stuff added by Kilian S.
async function updateFocusAreas() {
  const focusValue: string = WA.state.focus as string;
  const focusAreas = ['focusArea'];

  for (const areaName of focusAreas) {
      const focusArea = await WA.room.area.get(areaName);
      if (focusArea) {
          if (focusValue === "1") {
              focusArea.height = 375;
              focusArea.width = 765;
              console.log(`Area '${areaName}' resized to height: 375, width: 765`);
          } else if (focusValue === "") {
              focusArea.height = 0;
              focusArea.width = 0;
              console.log(`Area '${areaName}' resized to 0`);
          }
      }
  }
}

WA.onInit().then(() => {
  updateFocusAreas();
});

WA.state.onVariableChange('focus').subscribe(() => {
  updateFocusAreas();
});


WA.player.state.onVariableChange('pomo-exp').subscribe(async (value) => {
  console.log('Variable "pomo-exp" changed. New value: ', value);
  try {
      await levelUp("FOCUS", value as number);
      console.log(`Granted ${value} XP for Focus Session`);
  } catch (error) {
      console.error("Error while granting XP for Focus Session:", error);
  }
});


WA.onInit().then(() => {
  let closedPopup: any;
  // Open the popup when we enter a given zone
  WA.room.onEnterLayer("doorstepsFocus_in").subscribe(() => {
    if (WA.state.pw_door !== undefined && WA.state.pw_focusDoor === false && !WA.player.tags.includes("admin")) {
      closedPopup = WA.ui.openPopup("popupFocus", 'Zurzeit ist keine Focus Session.', [{
        label: "Sessionkalendar",
        className: "primary",
        callback: () => {
          WA.ui.modal.openModal({
            title: "Sessionkalendar",
            src: 'https://www.commitcircle.so/c/community-events?iframe=true',
            allow: "fullscreen",
            allowApi: true,
            position: "center"
          });
        }
      }]);
    }
  });

  // Close the popup when we leave the zone.
  WA.room.onLeaveLayer("doorstepsFocus_in").subscribe(() => {
    if (closedPopup) {
      closedPopup.close();
    }
  });
});

WA.onInit().then(() => {
  let closedEventsPopup: any;
  // Open the popup when we enter a given zone
  WA.room.onEnterLayer("doorstepsEvents_in").subscribe(() => {
    if (WA.state.pw_door !== undefined && WA.state.pw_eventsDoor === false && !WA.player.tags.includes("test")) {
      closedEventsPopup = WA.ui.openPopup("popupEvents", 'Derzeit findet kein Event statt', [{
        label: "Eventkalendar",
        className: "primary",
        callback: () => {
          WA.ui.modal.openModal({
            title: "Eventkalendar",
            src: 'https://www.commitcircle.so/c/live-sessions/?sort=asc',
            allow: "fullscreen",
            allowApi: true,
            position: "center"
          });
        }
      }]);
    }
  });

  // Close the popup when we leave the zone.
  WA.room.onLeaveLayer("doorstepsEvents_in").subscribe(() => {
    if (closedEventsPopup) {
      closedEventsPopup.close();
    }
  });
});


export {};
