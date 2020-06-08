import React from "react";
import { shallow } from "enzyme";

import * as AuthContext from "../../provider/auth";
import authContext from "../../provider/auth";
import Header from "./header";
import { MenuItem } from "@material-ui/core";

describe('Header', () => {
  it("It should render Connect", () => {
    // jest.spyOn(AuthContext, "useAuth").mockImplementation(() => ({authStatus:{haveTriedLogin:false,isConnected:false,user:undefined}}));
  
    // const wrapper = shallow(
    //   <authContext.Provider>
    //     <Header/>
    //   </authContext.Provider>
    // ).dive();
    // expect(wrapper.find(MenuItem).text()).toEqual("Connect");
  });
  
  // it("It should render Disconnect", () => {
  //   jest.spyOn(AuthContext, "useAuth").mockImplementation(() => ({authStatus:{haveTriedLogin:true,isConnected:true,user:undefined}}));
  
  //   const wrapper = shallow(
  //     <authContext.Provider>
  //       <Header/>
  //     </authContext.Provider>
  //   ).dive();
  //   expect(wrapper.find(MenuItem).text()).toEqual("Disconnect");
  // });

  // it("It should render Connect with no data", () => {
  //   jest.spyOn(AuthContext, "useAuth").mockImplementation(() => ({authStatus:{}}));
  
  //   const wrapper = shallow(
  //     <authContext.Provider>
  //       <Header/>
  //     </authContext.Provider>
  //   ).dive();
  //   expect(wrapper.find(MenuItem).text()).toEqual("Connect");
  // });
  
})