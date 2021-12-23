import React from "react";
import "./App.css";
import axios from "axios";
import { Howl } from "howler";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      workMinutes: 24,
      workSecs: 60,
      breakMinutes: 4,
      breakSecs: 60,
      cycle: "work",
    };

    this.sound = new Howl({
      src: ["/level_up.mp3"],
    });
  }

  componentDidMount() {
    axios.get("http://localhost:5000").then((response) => {
      this.setState({ completed: response.data });
    });
  }

  pausePomodoro = () => {
    clearInterval(this.workTimer);
    clearInterval(this.breakTimer);
  };

  stopPomodoro = () => {
    this.pausePomodoro();
    this.setState({
      workMinutes: 24,
      workSecs: 60,
      cycle: "work",
    });
    this.startWorkCycle();
  };

  startWorkCycle = () => {
    if (this.breakTimer) clearInterval(this.breakTimer);

    this.workTimer = setInterval(() => {
      this.setState((prevState) => {
        return { workSecs: prevState.workSecs - 1 };
      });
      if (this.state.workSecs === 0) {
        this.setState((prevState) => {
          return {
            workMinutes: prevState.workMinutes - 1,
            workSecs: 60,
          };
        });
        if (this.state.workMinutes === -1) {
          this.startBreakCycle();
          this.sound.play();
          this.setState((prevState) => {
            return {
              workMinutes: 24,
              workSecs: 70,
              cycle: "break",
            };
          });

          axios.get("http://localhost:5000").then((response) => {
            const completed = { completed: response.data + 1 };
            axios.post("http://localhost:5000", completed);
            this.setState({ completed: completed.completed });
          });
        }
      }
    }, 1000);
  };

  startBreakCycle = () => {
    clearInterval(this.workTimer);

    this.breakTimer = setInterval(() => {
      this.setState((prevState) => {
        return { breakSecs: prevState.breakSecs - 1 };
      });
      if (this.state.breakSecs === 0) {
        this.setState((prevState) => {
          return {
            breakMinutes: prevState.breakMinutes - 1,
            breakSecs: 60,
          };
        });
        if (this.state.breakMinutes === -1) {
          this.startWorkCycle();
          this.sound.play();
          this.setState({ breakMinutes: 4, cycle: "work", breakSecs: 60 });
          const completed = { completed: this.state.completed };
          axios.post("http://localhost:5000", completed);
        }
      }
    }, 1000);
  };

  render() {
    return (
      <div className="App">
        {/* <h1>My very first actually-useful app</h1> */}
        <h1>My Pomodoro</h1>
        <h1>
          {this.state.cycle === "work"
            ? this.state.workMinutes
            : this.state.breakMinutes}
          :
          {this.state.cycle === "work"
            ? this.state.workSecs
            : this.state.breakSecs}
        </h1>
        <h2>Cycles completed: {this.state.completed}</h2>
        <button
          onClick={
            this.state.cycle === "work"
              ? this.startWorkCycle
              : this.startBreakCycle
          }
        >
          Play
        </button>
        <button onClick={this.pausePomodoro}>Pause</button>
        <br />
        <button onClick={this.stopPomodoro}>Restart</button>
      </div>
    );
  }
}

export default App;
