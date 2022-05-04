import React, { useState, useEffect, Fragment } from "react";
import GetFirebase from '../GetFirebase'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useAuth} from "../AuthContext"
import {useNavigate} from "react-router-dom"
import SignOut from "../SignOut"
import {getResources} from "../firebase"
import firebase from "../firebase";
import ResourceCard from "../components/ResourceCard";
import { Container, Nav, NavItem, Row, Navbar, NavDropdown, Button, Col, Stack, Form, FormControl } from 'react-bootstrap';
import CategoryNav from "../components/CategoryNav";
import TagNav from "../components/TagNav";
import SearchBar from "../components/SearchBar"
import AddResource from "../components/AddResourceButton"
import {ReactComponent as ArrowDown} from '../assets/arrow-down.svg'
import { Typeahead } from 'react-bootstrap-typeahead';

// resource library page
export default function ResourceLibrary() {
  const {currentUser} = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);

  const ref = firebase.firestore();
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [selectedResources, setSelectedResources] = useState([]);

  function navigateToSignIn() {
    navigate("/login");
  }

  // get all resources in resource collection on firebase
  function getResources() {
    setLoading(true);
    const resourcesRef = ref.collection("resources")
    resourcesRef.onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setResources(items);
      setSelectedResources(items);

      setLoading(false);
    });
  }

  // get all tags in tag collection on firebase
  function getTags() {
    const tagsRef = ref.collection("tags")
    tagsRef.onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setTags(items);
    });
  }

  // get all categories in category collection on firebase
  function getCategories() {
    const catRef = ref.collection("categories")
    catRef.onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setCategories(items);
    });
  }

  // add tag to selectedTags
  function selectTag(e) {
    const tag = e.target.innerHTML;   
    const index = selectedTags.indexOf(tag);
    if (index !== -1) {
      setSelectedTags(selectedTags.filter((e) => e !== tag));
      
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  // remove tag from selectedTags
  function removeTag(e) {
    const tag = e.target.id; 
    const index = selectedTags.indexOf(tag);
    if (index !== -1) {
      setSelectedTags(selectedTags.filter((e) => e !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  // handle search bar changes
  function handleSelected(selected) {
    const searchSelected = selected[0];
    navigate(
      `/Resource/${searchSelected.id}`,
      {
          state: {
              source: searchSelected
          }
      }
    )
  }

  // update selected category
  function handleCategorySelect(e) {
    setSelectedCategory(e.target.innerHTML)
  }

  function checkIfRender(r) {
    if (selectedTags.length == 0) {
      return true;
    }
    for (let i=0; i<selectedTags.length; i++) {
      if (r.tags.indexOf(selectedTags[i]) == -1) {
        return false
      }
    }
    return true;
  }

  useEffect(() => {
    getResources();
    getTags();
    getCategories();

  }, []);
    
  return ( 
    <Container data-testid="resource-library" fluid={true}>
        <Stack className="resource-library-header" direction="horizontal" gap={3}>
            <h1 className="resource-library-title me-auto">Resource Library</h1>
            {currentUser ? (
            <>
           <Button data-testid="admin-mode" variant="outline-secondary" disabled>Admin Mode</Button>
           <div className="header-btn-holder">
           <AddResource />
            <SignOut />
           </div>
            
            </>
            ) : 
                <Button data-testid="admin-login" onClick={navigateToSignIn}>
                Admin Login
                </Button>
            }
        </Stack>
       
        <CategoryNav selectedCategory={selectedCategory} categories={categories} handleClick={handleCategorySelect}/>
        <Container fluid={true}>
            <Row>
                <Col className="tag-nav-container" lg={2}>
                  <Navbar className="flex-column sidebar" expand="lg">
                    <Navbar.Brand className="filters-brand">Filters</Navbar.Brand>
                    <Navbar.Toggle aria-controls="filter-sidebar-nav"><div className="arrow-down"><ArrowDown /></div></Navbar.Toggle>
                    <Navbar.Collapse id="filter-sidebar-nav">
                    <Nav className="bg-light flex-column sidebar">
                        {tags.map((tag) => {
                          if (selectedTags.includes(tag.name)) {
                            return (
                              <Nav.Item className="sidebar-item">
                                <Nav.Link className="sidebar-link active-link" onClick={selectTag}>{tag.name}</Nav.Link>
                              </Nav.Item>
                            )
                          } else {
                            return (
                              <Nav.Item className="sidebar-item">
                                <Nav.Link className="sidebar-link" onClick={selectTag}>{tag.name}</Nav.Link>
                              </Nav.Item>
                            )
                          }
                        })}
                    </Nav>
                    </Navbar.Collapse>
                  </Navbar>
                </Col>
                <Col>
                    <div className="search-bar-container">
                      <Form.Group className="search-div">
                        <Form className="search-bar d-flex">
    
                        <Typeahead
                          id="basic-typeahead-single"
                          labelKey={option => `${option.title}: ${option.desc}`}
                          options={resources}
                          placeholder="Search for a resource..."
                          onChange={handleSelected}
          
                        />
                        </Form>

                      </Form.Group>
                    </div>
                    <div className="tags-container">
                    {selectedTags.map((tag) => {
                        return (
                        <div onClick={removeTag} id={tag} className="tag-pill" key={tag}>{tag}<img id={tag} className="x" src={require('../assets/x.png')}></img></div>
                        )
                      })}
                    </div>
                    
                    <Container className="resources-container">
                        {loading ? <p>Loading...</p> : null}
                          <Row>
                          {selectedResources.filter((r) => {
                            if (selectedCategory == 'All' || r.category == selectedCategory) {
                              return checkIfRender(r)
                            } else {
                              return false;
                            }
                          
                        }).map((resource) => (
                            <Col lg={3} md={6} sm={12}>
                            <ResourceCard {...resource } key={resource.id} />
                            </Col>
                        ))}
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    </Container>   
      
    
  )
}
