// Runs inside the demo's app window (demo/tour.js loads it after app/mock.js and before app.js):
// tells the tour what DropLaunch does (its commands, the setup's progress, the server's events)
// and lets the app resize its window the way it does on a PC (More options makes it wider).
(() => {
  const tour = window.parent !== window ? window.parent.__demoTour : null;
  const api = window.__TAURI__;
  if (!tour || !api) return;

  // util.js takes invoke from here when app.js loads, so the tour sees every command.
  const invoke = api.core.invoke;
  api.core.invoke = async (cmd, args = {}) => {
    const channel = args?.onEvent;
    const call = channel
      ? {
          ...args,
          onEvent: {
            get onmessage() {
              return (ev) => {
                tour.progress(cmd, ev);
                channel.onmessage?.(ev);
              };
            },
          },
        }
      : args;
    tour.command(cmd, args, "start");
    try {
      const result = await invoke(cmd, call);
      tour.command(cmd, args, "done", result);
      return result;
    } catch (err) {
      tour.command(cmd, args, "failed", err);
      throw err;
    }
  };

  for (const name of ["server", "playtest"]) api.event.listen(name, (e) => tour.event(name, e.payload));

  const win = api.window.getCurrentWindow();
  win.setSize = async (size) => tour.resize(size.width / devicePixelRatio, size.height / devicePixelRatio);
  win.setMinSize = async (size) => tour.minSize(size.width, size.height);
})();
