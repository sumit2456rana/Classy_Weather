import { Component } from "react";
import "./styles.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: "",
      weather: {},
      displayName: "",
      isLoading: false
    };
    this.handleSetLocation = this.handleSetLocation.bind(this);
  } 
  handleSetLocation(e) {
    this.setState(() => {
      return { location: e.target.value };
    });
  }
  async fetchWheather() {
    if (this.state.location.length < 3) {
      this.setState({ weather: {} });
      return;
    }
    this.setState({ isLoading: true });
    try {
      const resp1 = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const data1 = await resp1.json();

      if (!data1.results) throw new Error("No data Found!!");

      const rs1 = data1.results[0];
      const { latitude, longitude, name, timezone, country } = rs1;
      const resp2 = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );

      const data2 = await resp2.json();

      this.setState({ weather: data2.daily, displayName: `Weather ${name}` });
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  componentDidMount() {
    this.fetchWheather();
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.location != prevState.location) {
      this.fetchWheather();
    }
  }
  render() {
    return (
      <div className="main">
        <div className="orange"></div>
        <div className="App">
          <h1>Classy Weather</h1>
          <Input
            location={this.state.location}
            handleSetLocation={this.handleSetLocation}
          />
          {/* <ul>
            {this.state.weather.time &&
              this.state.weather.time.map((e) => <li>{e}</li>)}
          </ul> */}

          <h2>
            {this.state.isLoading ? "Loading..." : this.state.displayName}
          </h2>
          <Weather weather={this.state.weather} />
          {/* <div>
              <ul className="weather">
              <Day />
              <Day />
              <Day />
              <Day />
              <Day />
              <Day />
            </ul>
          </div> */}
        </div>
        <div className="purple"></div>
      </div>
    );
  }
}
class Weather extends Component {
  render() {
    // console.log(this.props.weather);
    const {
      time: dates,
      weathercode,
      temperature_2m_max: maxArr,
      temperature_2m_min: minArr
    } = this.props.weather;
    return (
      <div>
        <ul className="weather">
          {dates &&
            dates.map((eDate, i) => {
              return (
                <Day
                  code={weathercode.at(i)}
                  date={eDate}
                  max={maxArr.at(i)}
                  min={minArr.at(i)}
                  key={i}
                  isToday={i === 0}
                />
              );
            })}
        </ul>
      </div>
    );
  }
}
function getWeather(code) {
  const iconsMap = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "️️🌫️"],
    [[51, 56, 61, 66, 80], "🌧️"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌧️"],
    [[95], "🌩"],
    [[96, 99], "⛈️"]
  ]);
  const arr = [...iconsMap.keys()].find((key) => key.includes(code));

  if (!arr) return "Not Found!";

  return iconsMap.get(arr);
}
class Day extends Component {
  render() {
    const { code, date, min, max, isToday } = this.props;
    const day = Intl.DateTimeFormat("en", { weekday: "short" }).format(
      new Date(date)
    );
    return (
      <li className="day">
        <span>{getWeather(code)}</span>
        <p>{isToday ? "Today" : day}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
      </li>
    );
  }
}

class Input extends Component {
  render() {
    return (
      <input
        type="text"
        placeholder="Serch From Location"
        value={this.props.location}
        onChange={this.props.handleSetLocation}
      />
    );
  }
}
export default App;
