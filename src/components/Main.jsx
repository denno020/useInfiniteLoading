import React from "react";
import { Switch, Route } from "react-router-dom";
import PLP from "./PLP";
import PDP from "./PDP";

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/" component={PLP} />
      <Route exact path="/pdp" component={PDP} />
    </Switch>
  </main>
);

export default Main;
