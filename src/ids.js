export default {
  main: "board",
  gen: {
    main: "gen-main",
    size: {
      main: "gen-size-sel",
      custom: {
        main: "gen-size-sel-custom",
        width: "gen-size-sel-w",
        height: "gen-size-sel-h",
        width_err: "gen-size-sel-w-err",
        height_err: "gen-size-sel-h-err"
      }
    },
    white: {
      human: "gen-white-human",
      random: "gen-white-random",
      ai: "gen-white-ai"
    },
    black: {
      human: "gen-black-human",
      random: "gen-black-random",
      ai: "gen-black-ai"
    },
    starting_player: {
      white: "gen-white-start",
      black: "gen-black-start",
      random: "gen-random-start"
    },
    submit: "gen-submit"
  },
  reset: "reset"
};
