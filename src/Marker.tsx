// a "normal" marker that uses a static image as an icon.
// large numbers of markers of this type can be added to the map
// very quickly and efficiently

import * as PropTypes from "prop-types";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";

import getDomMarkerIcon from "./utils/get-dom-marker-icon";
import getMarkerIcon from "./utils/get-marker-icon";

// declare an interface containing the required and potential
// props that can be passed to the HEREMap Marker component
export interface MarkerProps extends H.map.Marker.Options, H.geo.IPoint {
  bitmap?: string;
}

// declare an interface containing the potential context parameters
export interface MarkerContext {
  map: H.Map;
}

// export the Marker React component from this module
export class Marker extends React.Component<MarkerProps, object> {
  // define the context types that are passed down from a <HEREMap> instance
  public static contextTypes: React.ValidationMap<{ map: any }> = {
    map: PropTypes.object
  };

  public context: MarkerContext;

  private marker: H.map.DomMarker | H.map.Marker;

  // change the position automatically if the props get changed
  public componentWillReceiveProps(nextProps: MarkerProps) {
    if (nextProps.lat !== this.props.lat || nextProps.lng !== this.props.lng) {
      this.setPosition({
        lat: nextProps.lat,
        lng: nextProps.lng
      });
    }

    const nextChildren = (nextProps as any).children;
    if (this.props.children !== nextChildren) {
      this.updateMarkerIcon();
    }
  }

  // remove the marker on unmount of the component
  public componentWillUnmount() {
    const { map } = this.context;

    if (this.marker) {
      map.removeObject(this.marker);
    }
  }

  public render(): JSX.Element {
    const { map } = this.context;

    if (map && !this.marker) {
      this.addMarkerToMap();
    }

    return null;
  }

  private addMarkerToMap() {
    const { map } = this.context;

    const { lat, lng } = this.props;

    let marker: H.map.DomMarker | H.map.Marker;

    const icon = this.getIcon();
    if (icon !== null) {
      if (icon instanceof H.map.DomIcon) {
        marker = new H.map.DomMarker({ lat, lng }, { icon });
      } else {
        marker = new H.map.Marker({ lat, lng }, { icon });
      }
    } else {
      marker = new H.map.Marker({ lat, lng });
    }
    map.addObject(marker);

    this.marker = marker;
  }

  private updateMarkerIcon() {
    const icon = this.getIcon();
    this.marker.setIcon(icon);
  }

  private getIcon(): H.map.DomIcon | H.map.Icon | null {
    const { bitmap, children } = this.props;
    if (React.Children.count(children) > 0) {
      const html = ReactDOMServer.renderToStaticMarkup(
        <div className="dom-marker">{children}</div>
      );
      return getDomMarkerIcon(html);
    } else if (bitmap) {
      return getMarkerIcon(bitmap);
    } else {
      return null;
    }
  }

  private setPosition(point: H.geo.IPoint): void {
    this.marker.setPosition(point);
  }
}

// make the Marker component the default export
export default Marker;
