FROM python:3.8.18-alpine3.18

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY rtd-influx.py ./
RUN mkdir logs
RUN touch logs/rtd-influx.log

CMD [ "python", "./rtd-influx.py" ]