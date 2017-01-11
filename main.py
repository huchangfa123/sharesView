# coding: utf-8

import requests
import re
import threading

lock = threading.Lock()

proxies = { "http": "http://127.0.0.1:8123", "https": "http://127.0.0.1:8123", }

c = requests.get("http://hq.gucheng.com/gpdmylb.html")


response = c.text.encode('ISO-8859-1').decode(requests.utils.get_encodings_from_content(c.text)[0])

regex = r"[A-Z]{2}[0-9]{6}"

gupiao_list = re.findall(regex, response)

gupiao_lists = []

for gupiao in gupiao_list:
    if gupiao[:2] == 'SH':
        gupiao_lists.append("{}.{}".format(gupiao[2:], 'ss'))
    else:
        gupiao_lists.append("{}.{}".format(gupiao[2:], gupiao[:2].lower()))

error_string = "you're having trouble locating a destination on Yahoo!"

print len(gupiao_lists)
print gupiao_lists

def get_gupiao(ss):
    if ss =="" or ss is None:
        pass
    else:
        url = "http://table.finance.yahoo.com/table.csv?s={}".format(ss)
        
        c = requests.get(url, proxies=proxies)

        if c.text.find(error_string) == -1:
            # success
            with file(ss, 'wb') as f:
                f.write(c.text)

                f.close()
            print "{} done".format(ss)
        else:
            print "{} does not exist".format(ss)


def loop():

    while True:

        this_gupiao = None
        
        lock.acquire()
        try:
            this_gupiao = None
            if len(gupiao_lists) > 0:
                
                this_gupiao = gupiao_lists[0]
                gupiao_lists.remove(this_gupiao)
            else:
                lock.release()
                return None

                # do save()
        finally:
            lock.release()
        
        if this_gupiao is not None:
            # print this_gupiao
            get_gupiao(this_gupiao)


t = []
for _ in range(10):
    t.append(threading.Thread(target=loop))

for i in t:
    i.start()

for i in t:
    i.join()