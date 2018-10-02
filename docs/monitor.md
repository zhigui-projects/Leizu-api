# Monitoring setup

We are using pull mode of Prometheus to collect time series metrics data. Display the data with the beautiful Grafana
dashboard. All the metrics data come from the cAdvisor and all the targets come from the Consul. If you want to monitor
the resource usage of the docker host, [`Node Exporter`](https://prometheus.io/docs/guides/node-exporter/) would be a good option.

Here is the full picture of the monitoring architecture.

![Prometheus Architecture](./prometheus-architecture.png)

## Master node

Master node need to install the following components:

* Prometheus - pull and store time series metrics data
* Grafana - the leading open source software for time series analytics
* cAdvisor - collect metrics data of the containers
* Consul - consul server agent for Prometheus to discover targets automatically

## Worker node

Worker node need to install the following components:

* cAdvisor - collect metrics data of the containers
* Consul - consul client agent registered in consul server as a service

## Installation

### Prometheus

Three different options for [installation](https://prometheus.io/docs/prometheus/latest/installation). We install it in
the docker way.

```
docker run -p 9090:9090 -v ./prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

### Grafana

Grafana is very easy to install and run using the official docker container.

```
docker run -d -p 3000:3000 grafana/grafana
```

Read the [Docker installation](http://docs.grafana.org/installation/docker) guide for more info.

### cAdvisor

cAdvisor (Container Advisor) provides container users an understanding of the resource usage and performance
characteristics of their running containers.

```
sudo docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  --detach=true \
  --name=cadvisor \
  google/cadvisor:latest
```

### Consul

We need to install Consul on both master node and worker node.

* Consul server

On master node, we need to start consul in server mode.

```
consul agent -server -bind=172.20.252.131 -bootstrap-expect=1 -data-dir=./data
```

If you want to access consul server from any where, `-client=0.0.0.0` parameter is needed. Otherwise you may access to
it with `localhost:8500` only.

* Consul client

On each worker node, we need to start consul in client mode and then register service in the server agent.

```
consul agent -bind=172.20.252.130 -data-dir=./data
```

Then call consul API to [register service](https://www.consul.io/api/agent/service.html#register-service).

Sample payload:

```
{
	"Name": "cello-master",
	"Address": "172.20.252.131",
	"Port": 8080
}
```

The `Name` is a logical name of the service. Many service instance may have the same name. The `Address` and `Port` are
point to the cAdvisor endpoint. Prometheus will use the `Address` and `Port` as the target endpoint.

Save the sample payload into `data.json`, then call API with `curl`:

```
curl --request PUT --data @payload.json http://127.0.0.1:8500/v1/agent/service/register
```

