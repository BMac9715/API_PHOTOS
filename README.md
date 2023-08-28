
# EXTERNAL API FOR PHOTOS

Collection of endpoints for retrieve data of jsonplaceholder.typicode.com

## Tools for development
| Name |Versión | Scope |
|--|--|--|
| NodeJS | 18.12.1 | global |
| npm| 8.19.2 | global |
| typescript| 5.2.2 | global |
| ts-node| 10.9.1 | global |

## Install Dependencies

Install all package dependencies (one time operation)

```shell
npm install
```

## Run It
#### Run in *development* mode:
Runs the application is development mode. Should not be used in production

```shell
npm run dev
```

or debug it

```shell
npm run dev:debug
```

#### Run in *production* mode:

Compiles the application and starts it in production production mode.

```shell
npm run compile
npm start
```

## Try It
* Open your browser to [http://localhost:3000](http://localhost:3000)
* Invoke the `/photos` endpoint 
  ```shell
  curl http://localhost:3000/externalapi/photos
  ```
 * Invoke the `/photos/:id` endpoint 
  ```shell
  curl http://localhost:3000/externalapi/photos/:id
  ```

## Docker
In the root of the project you would see **Dockerfile**

#### Create image
```shell
  #On the root of the project
  docker build -t image:tag .
  ```

#### Run container
By default the expose port always will be on port 3000, if you want to change it, you will need to update **server config (index.ts)** and **dockerfile**
```shell
  docker run -p 3000:3000 image-id
  ```

## Special development tool

In order to satisfy the request with management and process data, I decided to use **RxJS** library. This library is useful for process large data and it has operators with differents purposes.
![enter image description here](https://rxjs.dev/generated/images/marketing/home/Rx_Logo-512-512.png)
