<featureType>
    <name>{{ nameshapefile }}</name>
    <nativeName>{{nameshapefile}}</nativeName>
    <namespace>
        <name>Mineria</name>
        <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://{{G_HOST}}/geoserver/rest/namespaces/Mineria.xml" type="application/xml"/>
    </namespace>
    <title>{{nameshapefile}}</title>
    <keywords>
        <string>features</string>
        <string>{{nameshapefile}}</string>
    </keywords>
    <srs>EPSG:4326</srs>
    <projectionPolicy>FORCE_DECLARED</projectionPolicy>
    <enabled>true</enabled>
    <metadata>
        <entry key="cachingEnabled">false</entry>
        <entry key="JDBC_VIRTUAL_TABLE">
        <virtualTable>
            <name>{{nameshapefile}}</name>
            <sql>select idshapefile, id_0, layername, expediente, categoria, fecha, geom  from shapefiles where layername = '{{nameshapefile}}' order by idshapefile asc</sql>
            <escapeSql>false</escapeSql>
            <keyColumn>idshapefile</keyColumn>
            <geometry>
                <name>geom</name>
                <type>{{type}}</type>
                <srid>4326</srid>
            </geometry>
        </virtualTable>
        </entry>
        <entry key="time">
            <dimensionInfo>
                <enabled>true</enabled>
                <attribute>fecha</attribute>
                <presentation>CONTINUOUS_INTERVAL</presentation>
                <units>ISO8601</units>
                <defaultValue>
                    <strategy>MAXIMUM</strategy>
                </defaultValue>
            </dimensionInfo>
        </entry>
    </metadata>
    <store class="dataStore">
        <name>postgis</name>
        <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://{{G_HOST}}/geoserver/rest/workspaces/Mineria/datastores/postgis.xml" type="application/xml"/>
    </store>
    <maxFeatures>0</maxFeatures>
    <numDecimals>0</numDecimals>
</featureType>