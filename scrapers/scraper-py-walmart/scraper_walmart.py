import requests
import json

url = "https://www.walmart.com/orchestra/snb/graphql/Search/c0be3cc4546bc06152e6967194463cb5a237939e90451752293bee56d59ffc20/search?variables=%7B%22id%22%3A%22%22%2C%22affinityOverride%22%3A%22store_led%22%2C%22pap%22%3A%22%7B%5C%22polaris%5C%22%3A%7B%5C%22ms_max_page_within_rerank%5C%22%3A7%2C%5C%22ms_slp%5C%22%3A38%2C%5C%22ms_triggered%5C%22%3Atrue%7D%7D%22%2C%22dealsId%22%3A%22%22%2C%22query%22%3A%22grocery%22%2C%22page%22%3A3%2C%22prg%22%3A%22desktop%22%2C%22catId%22%3A%22%22%2C%22facet%22%3A%22%22%2C%22sort%22%3A%22best_match%22%2C%22rawFacet%22%3A%22%22%2C%22seoPath%22%3A%22%22%2C%22ps%22%3A40%2C%22limit%22%3A40%2C%22ptss%22%3A%22%22%2C%22trsp%22%3A%22%22%2C%22beShelfId%22%3A%22%22%2C%22recall_set%22%3A%22%22%2C%22module_search%22%3A%22%22%2C%22min_price%22%3A%22%22%2C%22max_price%22%3A%22%22%2C%22storeSlotBooked%22%3A%22%22%2C%22additionalQueryParams%22%3A%7B%22hidden_facet%22%3Anull%2C%22translation%22%3Anull%2C%22isMoreOptionsTileEnabled%22%3Atrue%2C%22isGenAiEnabled%22%3Atrue%7D%2C%22searchArgs%22%3A%7B%22query%22%3A%22grocery%22%2C%22cat_id%22%3A%22%22%2C%22prg%22%3A%22desktop%22%2C%22facet%22%3A%22%22%7D%2C%22ffAwareSearchOptOut%22%3Afalse%2C%22fitmentFieldParams%22%3A%7B%22powerSportEnabled%22%3Atrue%2C%22dynamicFitmentEnabled%22%3Atrue%2C%22extendedAttributesEnabled%22%3Atrue%7D%2C%22fitmentSearchParams%22%3A%7B%22id%22%3A%22%22%2C%22affinityOverride%22%3A%22store_led%22%2C%22pap%22%3A%22%7B%5C%22polaris%5C%22%3A%7B%5C%22ms_max_page_within_rerank%5C%22%3A7%2C%5C%22ms_slp%5C%22%3A38%2C%5C%22ms_triggered%5C%22%3Atrue%7D%7D%22%2C%22dealsId%22%3A%22%22%2C%22query%22%3A%22grocery%22%2C%22page%22%3A3%2C%22prg%22%3A%22desktop%22%2C%22catId%22%3A%22%22%2C%22facet%22%3A%22%22%2C%22sort%22%3A%22best_match%22%2C%22rawFacet%22%3A%22%22%2C%22seoPath%22%3A%22%22%2C%22ps%22%3A40%2C%22limit%22%3A40%2C%22ptss%22%3A%22%22%2C%22trsp%22%3A%22%22%2C%22beShelfId%22%3A%22%22%2C%22recall_set%22%3A%22%22%2C%22module_search%22%3A%22%22%2C%22min_price%22%3A%22%22%2C%22max_price%22%3A%22%22%2C%22storeSlotBooked%22%3A%22%22%2C%22additionalQueryParams%22%3A%7B%22hidden_facet%22%3Anull%2C%22translation%22%3Anull%2C%22isMoreOptionsTileEnabled%22%3Atrue%2C%22isGenAiEnabled%22%3Atrue%7D%2C%22searchArgs%22%3A%7B%22query%22%3A%22grocery%22%2C%22cat_id%22%3A%22%22%2C%22prg%22%3A%22desktop%22%2C%22facet%22%3A%22%22%7D%2C%22ffAwareSearchOptOut%22%3Afalse%2C%22cat_id%22%3A%22%22%2C%22_be_shelf_id%22%3A%22%22%7D%2C%22enableFashionTopNav%22%3Afalse%2C%22enableRelatedSearches%22%3Atrue%2C%22enablePortableFacets%22%3Atrue%2C%22enableFacetCount%22%3Atrue%2C%22fetchMarquee%22%3Atrue%2C%22fetchSkyline%22%3Atrue%2C%22fetchGallery%22%3Afalse%2C%22fetchSbaTop%22%3Atrue%2C%22fetchSBAV1%22%3Afalse%2C%22enableAdsPromoData%22%3Afalse%2C%22fetchDac%22%3Afalse%2C%22tenant%22%3A%22WM_GLASS%22%2C%22enableMultiSave%22%3Afalse%2C%22enableInStoreShelfMessage%22%3Afalse%2C%22enableSellerType%22%3Afalse%2C%22enableAdditionalSearchDepartmentAnalytics%22%3Afalse%2C%22enableFulfillmentTagsEnhacements%22%3Afalse%2C%22enableRxDrugScheduleModal%22%3Afalse%2C%22enablePromoData%22%3Afalse%2C%22enableSignInToSeePrice%22%3Afalse%2C%22enablePromotionMessages%22%3Afalse%2C%22enableItemLimits%22%3Afalse%2C%22enableCanAddToList%22%3Afalse%2C%22enableIsFreeWarranty%22%3Afalse%2C%22enableShopSimilarBottomSheet%22%3Afalse%2C%22pageType%22%3A%22SearchPage%22%7D"

headers = {
  'accept': 'application/json',
  'accept-language': 'en-US',
  'baggage': 'trafficType=customer,deviceType=desktop,renderScope=CSR,webRequestSource=Browser,pageName=searchResults,isomorphicSessionId=ZzPSH9VMQH2mXIGlrYBdF,renderViewId=082f65ef-f2bc-4592-8072-858048066314',
  'content-type': 'application/json',
  'device_profile_ref_id': 'qtjxfn9k0ezi3loiejhxjylovsee9xim5f1l',
  'downlink': '10',
  'dpr': '1.5',
  'priority': 'u=1, i',
  'referer': 'https://www.walmart.com/search?q=grocery&page=3&affinityOverride=store_led',
  'sec-ch-ua': '"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'tenant-id': 'elh9ie',
  'traceparent': '00-1824cd092a86d35b65445fecb7774bd5-cc8af0ebfae00427-00',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
  'wm_mp': 'true',
  'wm_page_url': 'https://www.walmart.com/search?q=grocery&page=3&affinityOverride=store_led',
  'wm_qos.correlation_id': 'DhJNNuqPOcg-FBcuaTQb-B8si9tnd5QJiN0k',
  'x-apollo-operation-name': 'Search',
  'x-enable-server-timing': '1',
  'x-latency-trace': '1',
  'x-o-bu': 'WALMART-US',
  'x-o-ccm': 'server',
  'x-o-correlation-id': 'DhJNNuqPOcg-FBcuaTQb-B8si9tnd5QJiN0k',
  'x-o-gql-query': 'query Search',
  'x-o-mart': 'B2C',
  'x-o-platform': 'rweb',
  'x-o-platform-version': 'us-web-1.179.0-b604c2b40cc2c3fd9027cd7a2ef2e2952432aa6f-021019',
  'x-o-segment': 'oaoh',
  'Cookie': 'AID=wmlspartner=0:reflectorid=0000000000000000000000:lastupd=1739736343354; TS01a90220=0195f5bf7580f820c2d6a8eed2f2520ce93e3088fd399a9094237573b2bfc4cb394b5ce4e4ea4f943d04de965b3a351da4ce1b10b4; ak_bmsc=F7F62C5B0A646D7FCEEF3416020B76E9~000000000000000000000000000000~YAAQFfjNF1gEvAKVAQAA89JbEBocaa1SMoObVmU8YfHiIWpuwAyaNxJuHGpDHPB5A9VMbAKBlMMgE2pW7cQzyE/o017ZIdTzd2jWi/3n2CEqSVENd6CgIEqSDuF79QM3WzhyIJdivbrFKKuABxhGBSZcWulan+qi4TWpPJ1wYHi1bL6Fwh0ezoHcpKTq7A4MNj1Z0XG17J4gOxN7J+1muCmuhzN1+JIXlWur96sE1xVwdaK+Uzi9oifvBpqxyqugnMxClDrsv5xrgNG7fHxbqmrXsIArl5zpjHajTVXEogL2eYSOrKhoOXg8FBS115ZGKpVvcDCRQ25eDFJTwKvm8DvkY0UrbvHCJknNvA==; bm_mi=C2F4684A625D74E54E966E966474FD85~YAAQKvjNFzU0ovqUAQAAVSxgEBopF9FXhZTrA+mWV67V1DqaSj5l6YiY3pbbMqbnYsn801XXdIgA8+cR5AFrM6JzWvMQTgb1IakbhkmQwNP05u72vHkfk73jaRVbNd9Z672w+3KuojLsFG70s7Yx3AobTgriObBmfuiGQymAedmuCxQRIlJQyVDfVu4/k0ICQBm9F6YixO4wEPCMxRqM68E5HEyZX44idBc/rhS9GpIzVHrfTyr/bSFV0lKcSWZ24xwid6l5nAz3fGF60tWyr/xRnDZpegpUz6mchtFDZpJkbUDRbnVDxsWzx9cD3l8ug2L3mg==~1; bm_sv=5878751D058749AF40952E039F1CBBA6~YAAQKvjNFzY0ovqUAQAAVSxgEBqitK6HcTWNamr9bze+ca+Oa/q7K0sG2eDkM5gZtcmD6QlHQ5UZjo1IpRrqLE0bdL9Q57ZLGM6msZB4Bxck3RjMhkSQ2Vw7SU+j9rNv8qdW+3gN8oIJWed1R5hHoNVoBPDMxxDLVpJ6a7pxuis5kmmlXCRyUTHQnP31oWkKP7QtFWN2h3WsjJVafw3deAKWi0Kbb5E/swwRVpANdv5XDCfmtvdRGKjQENZCtSgqnw==~1; com.wm.reflector=reflectorid:0000000000000000000000@lastupd:1739736343354@firstcreate:1739736206750; vtc=TpkaQXpHlizXSh8R0q6HBE; xptwg=1433922526:220B9BF074DFB00:540CA04:EC866742:9A8A14F7:A717DC03:; xptwj=uz:785163be51761bc003dd:0K4jOqgoqxfBxjtdKbf2LJnzgXkgNYtuUnfo13n7fD/STb2y+SRR9GYLUN7vtMYRqwAieegS8lQLN769UDHKttYua4d9Dlt2Y62G6Gs4s3UDWnmYb0DpdbFJJf6Eh7NbdoB1TOLAQ4Ct2wkRwpfdPS+j5NoEp+lp9NjxJCR+Zw==; ACID=7e585245-cd08-4c01-a6f5-1333e99e7a89; TS012768cf=01d253c359d788ef7a92d99fc7584808dc166d5f3c87dad21cbee01a2b4a76995b9bd218020f5932fc162ddc6eb6f98992cefb1bb0; TS2a5e0c5c027=083b7df037ab2000e66834bf1469cbfe4ebc14dfa84ed4933edc48aaba94ac5d8d7362ce5916f09b0858c9289b1130002e5dd077bffd370eaac24c3e5b5cfac7406b598e10dec2787f30aa9cd78219d0596b5e6f405cd5905ba1f9e925a9ee78; _m=9; _pxhd=7c52c005bc297083c484d19bca31ae8412c349ab14dc99bcf52be775e13c0feb:1587c3a3-eca1-11ef-874a-c51b126f97c8; abqme=true; akavpau_p2=1739737093~id=6a195767b95294316482c12ddea40811; assortmentStoreId=1120; hasACID=true; hasLocData=1; locDataV3=eyJpc0RlZmF1bHRlZCI6ZmFsc2UsImlzRXhwbGljaXQiOmZhbHNlLCJpbnRlbnQiOiJTSElQUElORyIsInBpY2t1cCI6W3sibm9kZUlkIjoiMTEyMCIsImRpc3BsYXlOYW1lIjoiR2xhZHN0b25lIFN1cGVyY2VudGVyIiwiYWRkcmVzcyI6eyJwb3N0YWxDb2RlIjoiNjQxMTkiLCJhZGRyZXNzTGluZTEiOiI3MjA3IE4gTTEgSFdZIiwiY2l0eSI6IkdsYWRzdG9uZSIsInN0YXRlIjoiTU8iLCJjb3VudHJ5IjoiVVMifSwiZ2VvUG9pbnQiOnsibGF0aXR1ZGUiOjM5LjIyNTQyNywibG9uZ2l0dWRlIjotOTQuNTQ1Njg1fSwic2NoZWR1bGVkRW5hYmxlZCI6dHJ1ZSwidW5TY2hlZHVsZWRFbmFibGVkIjp0cnVlLCJzdG9yZUhycyI6IjA2OjAwLTIzOjAwIiwiYWxsb3dlZFdJQ0FnZW5jaWVzIjpbIk1PIl0sInN1cHBvcnRlZEFjY2Vzc1R5cGVzIjpbIkFDQyIsIkFDQ19JTkdST1VORCIsIlBJQ0tVUF9TUEVDSUFMX0VWRU5UIiwiUElDS1VQX0NVUkJTSURFIiwiUElDS1VQX0lOU1RPUkUiLCJQSUNLVVBfQkFLRVJZIl0sInRpbWVab25lIjoiQ1NUIiwic2VsZWN0aW9uVHlwZSI6IkxTX1NFTEVDVEVEIn0seyJub2RlSWQiOiIyNDkwIn0seyJub2RlSWQiOiI0NTUzIn0seyJub2RlSWQiOiIyMzQifSx7Im5vZGVJZCI6IjI0NDIifSx7Im5vZGVJZCI6IjYxNzIifSx7Im5vZGVJZCI6Ijk5OCJ9LHsibm9kZUlkIjoiNjUwMCJ9LHsibm9kZUlkIjoiMjg1NyJ9XSwic2hpcHBpbmdBZGRyZXNzIjp7ImxhdGl0dWRlIjozOS4xMjQyLCJsb25naXR1ZGUiOi05NC41NTQzLCJwb3N0YWxDb2RlIjoiNjQxODQiLCJjaXR5IjoiS2Fuc2FzIENpdHkiLCJzdGF0ZSI6Ik1PIiwiY291bnRyeUNvZGUiOiJVU0EiLCJsb2NhdGlvbkFjY3VyYWN5IjoibG93IiwiZ2lmdEFkZHJlc3MiOmZhbHNlLCJ0aW1lWm9uZSI6IkFtZXJpY2EvQ2hpY2FnbyIsImFsbG93ZWRXSUNBZ2VuY2llcyI6WyJNTyJdfSwiYXNzb3J0bWVudCI6eyJub2RlSWQiOiIxMTIwIiwiZGlzcGxheU5hbWUiOiJHbGFkc3RvbmUgU3VwZXJjZW50ZXIiLCJpbnRlbnQiOiJQSUNLVVAifSwiaW5zdG9yZSI6ZmFsc2UsImRlbGl2ZXJ5Ijp7Im5vZGVJZCI6IjExMjAiLCJkaXNwbGF5TmFtZSI6IkdsYWRzdG9uZSBTdXBlcmNlbnRlciIsImFkZHJlc3MiOnsicG9zdGFsQ29kZSI6IjY0MTE5IiwiYWRkcmVzc0xpbmUxIjoiNzIwNyBOIE0xIEhXWSIsImNpdHkiOiJHbGFkc3RvbmUiLCJzdGF0ZSI6Ik1PIiwiY291bnRyeSI6IlVTIn0sImdlb1BvaW50Ijp7ImxhdGl0dWRlIjozOS4yMjU0MjcsImxvbmdpdHVkZSI6LTk0LjU0NTY4NX0sInNjaGVkdWxlZEVuYWJsZWQiOmZhbHNlLCJ1blNjaGVkdWxlZEVuYWJsZWQiOmZhbHNlLCJhY2Nlc3NQb2ludHMiOlt7ImFjY2Vzc1R5cGUiOiJERUxJVkVSWV9BRERSRVNTIn1dLCJpc0V4cHJlc3NEZWxpdmVyeU9ubHkiOmZhbHNlLCJhbGxvd2VkV0lDQWdlbmNpZXMiOlsiTU8iXSwic3VwcG9ydGVkQWNjZXNzVHlwZXMiOlsiREVMSVZFUllfQUREUkVTUyIsIkFDQyJdLCJ0aW1lWm9uZSI6IkFtZXJpY2EvQ2hpY2FnbyIsInN0b3JlQnJhbmRGb3JtYXQiOiJXYWxtYXJ0IFN1cGVyY2VudGVyIiwic2VsZWN0aW9uVHlwZSI6IkxTX1NFTEVDVEVEIn0sImlzZ2VvSW50bFVzZXIiOmZhbHNlLCJtcERlbFN0b3JlQ291bnQiOjAsInJlZnJlc2hBdCI6MTczOTc1NzgwNjc5OSwidmFsaWRhdGVLZXkiOiJwcm9kOnYyOjdlNTg1MjQ1LWNkMDgtNGMwMS1hNmY1LTEzMzNlOTllN2E4OSJ9; locGuestData=eyJpbnRlbnQiOiJTSElQUElORyIsImlzRXhwbGljaXQiOmZhbHNlLCJzdG9yZUludGVudCI6IlBJQ0tVUCIsIm1lcmdlRmxhZyI6ZmFsc2UsImlzRGVmYXVsdGVkIjpmYWxzZSwicGlja3VwIjp7Im5vZGVJZCI6IjExMjAiLCJ0aW1lc3RhbXAiOjE3Mzk3MzYyMDY3OTcsInNlbGVjdGlvblR5cGUiOiJMU19TRUxFQ1RFRCIsInNlbGVjdGlvblNvdXJjZSI6IklQX1NOSUZGRURfQllfTFMifSwic2hpcHBpbmdBZGRyZXNzIjp7InRpbWVzdGFtcCI6MTczOTczNjIwNjc5NywidHlwZSI6InBhcnRpYWwtbG9jYXRpb24iLCJnaWZ0QWRkcmVzcyI6ZmFsc2UsInBvc3RhbENvZGUiOiI2NDE4NCIsImRlbGl2ZXJ5U3RvcmVMaXN0IjpbeyJub2RlSWQiOiIxMTIwIiwidHlwZSI6IkRFTElWRVJZIiwidGltZXN0YW1wIjoxNzM5NzMxMDgxMjk3LCJkZWxpdmVyeVRpZXIiOm51bGwsInNlbGVjdGlvblR5cGUiOiJMU19TRUxFQ1RFRCIsInNlbGVjdGlvblNvdXJjZSI6IklQX1NOSUZGRURfQllfTFMifV0sImNpdHkiOiJLYW5zYXMgQ2l0eSIsInN0YXRlIjoiTU8ifSwicG9zdGFsQ29kZSI6eyJ0aW1lc3RhbXAiOjE3Mzk3MzYyMDY3OTcsImJhc2UiOiI2NDE4NCJ9LCJtcCI6W10sIm1zcCI6eyJub2RlSWRzIjpbIjI0OTAiLCI0NTUzIiwiMjM0IiwiMjQ0MiIsIjYxNzIiLCI5OTgiLCI2NTAwIiwiMjg1NyJdLCJ0aW1lc3RhbXAiOjE3Mzk3MzYyMDY3ODd9LCJtcERlbFN0b3JlQ291bnQiOjAsInZhbGlkYXRlS2V5IjoicHJvZDp2Mjo3ZTU4NTI0NS1jZDA4LTRjMDEtYTZmNS0xMzMzZTk5ZTdhODkifQ==; userAppVersion=us-web-1.179.0-b604c2b40cc2c3fd9027cd7a2ef2e2952432aa6f-021019'
}

response = requests.request("GET", url, headers=headers)

data = json.loads(response.text)

with open('response.json', "w") as output_file:
    json.dump(data, output_file)