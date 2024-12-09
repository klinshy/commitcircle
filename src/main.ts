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
    if (WA.state.pw_focusDoor === false && !WA.player.tags.includes("admin")) {
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
    if (WA.state.pw_eventsDoor === false && !WA.player.tags.includes("admin")) {
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

// Function to send player data to the webhook
WA.onInit().then(async () => {
  /* #TODO
    This if statement adds unnecessary nesting.
    It should be refactored into the oposite condition, with a return statement to stop the function execution
    */
  if (!WA.player.tags.includes("bot")) {
    /* #TODO
    Declaring your function sendPlayerData inside of this IF statement, makes reading the code unnecessarily complicated.
    It can be declared somewhere else and used in this context. Making the if statement's intentions more explicit.
    By declaring this big function in this scope you're mixing your "behaviour declaration" with the control-flow logic without any real benefit.
    */
    async function sendPlayerData(
      firstPing = false,

      
    ) {
      const WEBHOOK_URL = "https://apps.taskmagic.com/api/v1/webhooks/Le9P227pmdc9BXrcgFyIx";
      /* #TODO
        Try catch when used like this isn't an anti-pattern, but could be made cleaner with promise chaining.
        (PROMISE.THEN(RES=>RES.JSON()).CATCH(E))
        */
      try {
        /* #TODO
        This code is already run inside of WA.onInit() on line 43.
        In theory you shouldn't need to await or call WA.onInit() in here again.
        */
        await WA.onInit();
        /* #TODO
          could be cleaner with object desctructuring syntax
          `const {id,name} = WA.player`
          especially because you're using `const payload = {id,name,firstPing}`  , later
         */
        const playerId = WA.player.uuid;
        const playerName = WA.player.name;
        console.log(playerName); // or use the playerName variable elsewhere in your code

        if (!playerId || !playerName) {
          throw new Error("Invalid player data");
        }

        // Create the payload
        const payload = {
          id: playerId,
          name: playerName,
          firstPing: firstPing,
        };

        /* #TODO
        This function has no dependencies and is only a helper function
        it doesn't HAVE to be declared inside of this scope / execution context
        moving it outside, would make the code cleaner / more focused
        */
        // Function to handle fetch with timeout
        const fetchWithTimeout = (url: string, options: RequestInit, timeout = 5000) => {
          return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timed out")), timeout)
            ),
          ]);
        };

        // Send the payload to the webhook
        const response = await fetchWithTimeout(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        /* #TODO
        This !response.ok and await response.json could be simpler,
        if you used promise chaining as in (PROMISE.THEN(RES=>RES.JSON()).CATCH(E))
        */
        if (!(response as Response).ok) {
          throw new Error(`HTTP error! status: ${(response as Response).status}`);
        }

        const data = await (response as Response).json();
        console.log("Success:", data);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    /* #TODO
    This firstPing parameter seems a little overly complicated. Is it really necessary?
    Maybe this could be simpler. What are you trying to achieve
    */
    let firstPing = true;

    /* #TODO
    because the parameter is already named in the function true or false could be used directly in here.
    */
    // Call the function to send player data initially with firstPing=true
    sendPlayerData(firstPing);

    // Set firstPing to false after the initial call
    firstPing = false;

    // Call the function every 60 seconds with firstPing=false
    setInterval(() => {
      sendPlayerData(firstPing);
    }, 60000);
  }
});


////////////////////////////////////////////////


export {};
