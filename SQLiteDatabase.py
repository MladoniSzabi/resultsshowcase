import sqlite3
import json

class SQLiteDatabase:

    def __init__(self,name = None):
        if name == None:
            name = "databases.db"
        self.name = "file:" + name + "?mode=ro"

    def __enter__(self):
        self.db = sqlite3.connect(self.name, uri=True)
        self.cur = self.db.cursor()
        return self
    
    def __exit__(self, *args):
        self.cur.close()
        self.db.close()

    def generate_query(self, filters):
        query = " WHERE 1=1"
        params = []

        if filters["name"]:
            query += " AND Name LIKE ?"
            params.append("%" + filters["name"] + "%")

        if filters["id"]:
            query += " AND rowid=?"
            params.append(filters["id"])
        
        if filters["product"]:
            query += " AND ProductReference LIKE ?"
            params.append("%" + filters["product"] + "%")

        if filters["graph_id"]:
            query += " AND GraphId=?"
            params.append(filters["graph_id"])

        if filters["cpc_code"]:
            query += " AND CPCCode LIKE ?"
            params.append(filters["cpc_code"] + "%")

        if filters["cpc_name"]:
            query += " AND CPCName LIKE ?"
            params.append("%" + filters["cpc_name"] + "%")
        
        if filters["graph_type"]:
            query += " AND Type LIKE ?"
            params.append("%" + filters["graph_type"] + "%")
        
        if filters["geography"]:
            query += " AND Geography LIKE ?"
            params.append("%" + filters["geography"] + "%")

        if filters["node_count"]:
            query += " AND NumberOfNodes = ?"
            params.append(filters["node_count"])
        
        if filters["depth"]:
            query += " AND Depth = ?"
            params.append(filters["depth"])

        if filters["sort_by"]:
            if filters["sort_by"] == "cpc-code":
                query += " ORDER BY CPCCode"
            elif filters["sort_by"] == "cpc-name":
                query += " ORDER BY CPCName"
            elif filters["sort_by"] == "name":
                query += " ORDER BY Name"
            elif filters["sort_by"] == "product":
                query += " ORDER BY ProductReference"
            elif filters["sort_by"] == "graph-type":
                query += " ORDER BY Type"
            elif filters["sort_by"] == "geography":
                query += " ORDER BY Geography"
            elif filters["sort_by"] == "node-count":
                query += " ORDER BY NumberOfNodes"
            elif filters["sort_by"] == "depth":
                query += " ORDER BY Depth"
        
            if filters["sort-order"] == "descending":
                query += " DESC"
            else:
                query += " ASC"

        print(query)
        return (query, params)

    def convert_result(self, sqlite_result, columns):
        retval = {}
        for name, val in zip(columns, sqlite_result):
            if name == "CPCName":
                retval["cpcName"] = val
            elif name == "CPCCode":
                retval["cpcCode"] = val
            else:
                name = name[0].lower() + name[1:]
                retval[name] = val
        return retval

    def get_count(self, query):
       return self.cur.execute("SELECT COUNT (*) FROM Graphs " + query[0], query[1]).fetchone()[0]

    def get_page(self, query, page_size:int = 5, page_number:int = 0, keys:None|list = None):
        collection = []

        if keys == None:
            query_str = "SELECT rowid as id, * FROM Graphs " + query[0]
        else:
            keys_conv = ["rowid" if k == 'id' else k for k in keys]
            query_str = "SELECT " + ', '.join(keys_conv) + " FROM Graphs " + query[0]
        
        query_str = query_str + " LIMIT " + str(int(page_size)) + " OFFSET " + str(int(page_size) * int(page_number))

        result = self.cur.execute(query_str, query[1])
        if keys == None:
            keys = [description[0] for description in result.description]
        result = result.fetchall()

        for res in result:
            collection.append(self.convert_result(res, keys))

        return collection

    def get_graph(self, graph_id:int, keys: None|list = None):
        if keys == None:
            res = self.cur.execute("SELECT rowis as id, * FROM Graphs WHERE rowid=" + str(int(graph_id)))
        else:
            keys_conv = ["rowid" if k == 'id' else k for k in keys]
            res = self.cur.execute("SELECT " + ', '.join(keys_conv) + " FROM Graphs WHERE rowid=" + str(int(graph_id)))
        
        if keys == None:
            keys = [description[0] for description in res.description]
        
        return self.convert_result(res.fetchone(), keys)
