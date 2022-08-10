<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <sld:NamedLayer>
    <sld:Name>centroides_canteras_faja3</sld:Name>
    <sld:UserStyle>
      <sld:Name>centroides_canteras_faja3</sld:Name>
      <sld:FeatureTypeStyle>
				 
        <sld:Name>name</sld:Name>
        <sld:Rule>
          <sld:Name>1</sld:Name>
						   
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>categoria</ogc:PropertyName>
              <ogc:Literal>1</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
						<Graphic>
							<Mark>
								<WellKnownName>circle</WellKnownName>
								<Fill>
									<CssParameter name="fill">#fa0505</CssParameter>
								</Fill>
                              	<Stroke>
									<CssParameter name="stroke">#000000</CssParameter>
						            <CssParameter name="stroke-width">0.5</CssParameter>
					            </Stroke>
							</Mark>
							<Size>6</Size>
						</Graphic>
					</PointSymbolizer>
        </sld:Rule>
        <sld:Rule>
          <sld:Name>2</sld:Name>
          <ogc:Filter>
								  
						   
															 
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>categoria</ogc:PropertyName>
              <ogc:Literal>2</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
						<Graphic>
							<Mark>
								<WellKnownName>circle</WellKnownName>
								<Fill>
									<CssParameter name="fill">#02d92a</CssParameter>
								</Fill>
                              <Stroke>
									<CssParameter name="stroke">#000000</CssParameter>
						            <CssParameter name="stroke-width">0.5</CssParameter>
					            </Stroke>
							</Mark>
							<Size>6</Size>
						</Graphic>
					</PointSymbolizer>
        </sld:Rule>
        <sld:Rule>
          <sld:Name>3</sld:Name>
          <ogc:Filter>														 
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>categoria</ogc:PropertyName>
              <ogc:Literal>3</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PointSymbolizer>
						<Graphic>
							<Mark>
								<WellKnownName>circle</WellKnownName>
								<Fill>
									<CssParameter name="fill">#f2e716</CssParameter>
								</Fill>
                                <Stroke>
									<CssParameter name="stroke">#000000</CssParameter>
						            <CssParameter name="stroke-width">0.5</CssParameter>
					            </Stroke>
							</Mark>
							<Size>6</Size>
						</Graphic>
					</PointSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </sld:NamedLayer>
</sld:StyledLayerDescriptor>
