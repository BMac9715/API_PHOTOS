import { Geolocation } from "./geolocation.entity";

export interface Address {
    street:  string;
    suite:   string;
    city:    string;
    zipcode: string;
    geo:     Geolocation;
}