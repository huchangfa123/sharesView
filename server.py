# coding: utf-8

from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/gpdmylb.html")
def list():

    return render_template("list.html")

@app.route("/table.csv")
def one():
    s = request.args.get('s', None)
    try:
        f = open(s, 'r')
        return f.read()
        f.close()
    except Exception as e:
        return 'ERROR'
    
    
    



app.run()
