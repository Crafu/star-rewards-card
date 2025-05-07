// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjk-Q3yd-uWW9dLTolW6qX1fefK84sMvs",
  authDomain: "star-rewards-card.firebaseapp.com",
  projectId: "star-rewards-card",
  storageBucket: "star-rewards-card.firebasestorage.app",
  messagingSenderId: "314753312693",
  appId: "1:314753312693:web:9e1b332ebc3a143f575bfc",
  measurementId: "G-524536NQZ4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// DOM Elements - Authentication
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const signInButton = document.getElementById('sign-in-button');
const registerButton = document.getElementById('register-button');
const authModal = document.getElementById('auth-modal');
const authModalTitle = document.getElementById('auth-modal-title');
const authForm = document.getElementById('auth-form');
const authSubmitButton = document.getElementById('auth-submit-button');
const switchAuthModeLink = document.getElementById('switch-auth-mode-link');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const resetPasswordModal = document.getElementById('reset-password-modal');
const resetPasswordForm = document.getElementById('reset-password-form');
const backToLoginLink = document.getElementById('back-to-login-link');
const userEmailDisplay = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

// DOM Elements - Dashboard
const dashboardView = document.getElementById('dashboard-view');
const cardDetailView = document.getElementById('card-detail-view');
const createdCardsTab = document.getElementById('created-cards-tab');
const assignedCardsTab = document.getElementById('assigned-cards-tab');
const tabItems = document.querySelectorAll('.tab-item');
const createCardButton = document.getElementById('create-card-button');
const createCardModal = document.getElementById('create-card-modal');
const createCardForm = document.getElementById('create-card-form');
const cardTitleInput = document.getElementById('card-title-input');
const cancelCreateCardButton = document.getElementById('cancel-create-card');
const createdCardsList = document.getElementById('created-cards-list');
const assignedCardsList = document.getElementById('assigned-cards-list');

// DOM Elements - Card Detail
const cardTitle = document.getElementById('card-title');
const completedTasksCount = document.getElementById('completed-tasks');
const totalTasksCount = document.getElementById('total-tasks');
const starsEarned = document.getElementById('stars-earned');
const tasksContainer = document.getElementById('tasks-container');
const addTaskSection = document.getElementById('add-task-section');
const newTaskInput = document.getElementById('new-task-input');
const addTaskButton = document.getElementById('add-task-button');
const redeemButton = document.getElementById('redeem-button');
const manageRewardsButton = document.getElementById('manage-rewards-button');
const shareCardSection = document.getElementById('share-card-section');
const recipientEmailInput = document.getElementById('recipient-email');
const sendInvitationButton = document.getElementById('send-invitation-button');
const invitationsContainer = document.getElementById('invitations-container');
const backToDashboardButton = document.getElementById('back-to-dashboard');
const toggleShareSectionButton = document.getElementById('toggle-share-section');

// DOM Elements - Reward Management
const rewardsManagerModal = document.getElementById('rewards-manager-modal');
const rewardsTabItems = document.querySelectorAll('#rewards-manager-modal .tab-item');
const customRewardsSection = document.getElementById('custom-rewards-section');
const amazonRewardsSection = document.getElementById('amazon-rewards-section');
const newRewardInput = document.getElementById('new-reward-input');
const addNewRewardButton = document.getElementById('add-new-reward-button');
const customRewardsList = document.getElementById('custom-rewards-list');
const amazonProductUrl = document.getElementById('amazon-product-url');
const addAmazonProductButton = document.getElementById('add-amazon-product-button');
const amazonLoading = document.getElementById('amazon-loading');
const amazonProductsList = document.getElementById('amazon-products-list');
const closeRewardsManagerButton = document.getElementById('close-rewards-manager');

// DOM Elements - Redemption
const redemptionModal = document.getElementById('redemption-modal');
const redeemNowButton = document.getElementById('redeem-now');
const saveForLaterButton = document.getElementById('save-for-later');
const rewardResultModal = document.getElementById('reward-result-modal');
const randomRewardDisplay = document.getElementById('random-reward-display');
const acceptRewardButton = document.getElementById('accept-reward');
const tryAnotherRewardButton = document.getElementById('try-another-reward');
const rewardAffiliateDisclosure = document.getElementById('reward-affiliate-disclosure');

// Variables
let authMode = 'signin';
let currentUser = null;
let currentCardId = null;
let currentCardData = null;
let isCardCreator = false;
let affiliateId = "goodhusband-21"; // Your Amazon Affiliate ID

// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Debug logging
    console.log("DOM fully loaded");
    
    // Auth state change listener
    auth.onAuthStateChanged(user => {
        console.log("Auth state changed:", user ? "User logged in" : "No user");
        if (user) {
            currentUser = user;
            authContainer.style.display = 'none';
            appContainer.style.display = 'block';
            userEmailDisplay.textContent = user.email;
            
            // Load user's reward cards
            loadUserCards();
        } else {
            currentUser = null;
            authContainer.style.display = 'block';
            appContainer.style.display = 'none';
        }
    });
    
    // Event Listeners - Authentication
    if (signInButton) {
        signInButton.addEventListener('click', () => {
            console.log("Sign in button clicked");
            showAuthModal('signin');
        });
    }
    
    if (registerButton) {
        registerButton.addEventListener('click', () => {
            console.log("Register button clicked");
            showAuthModal('register');
        });
    }
});

// Load user's reward cards
function loadUserCards() {
    // Clear previous lists
    createdCardsList.innerHTML = '';
    assignedCardsList.innerHTML = '';
    
    // Load cards created by the user
    db.collection('rewardCards')
        .where('createdBy', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                createdCardsList.innerHTML = '<p style="text-align: center; padding: 20px;">You haven\'t created any Star Rewards Cards yet.</p>';
            } else {
                snapshot.forEach(doc => {
                    const cardData = doc.data();
                    const cardElement = createCardElement(doc.id, cardData);
                    createdCardsList.appendChild(cardElement);
                });
            }
        })
        .catch(error => {
            console.error("Error loading created cards:", error);
        });
    
    // Load cards assigned to the user as Achiever
    db.collection('rewardCards')
        .where('assignedTo', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                assignedCardsList.innerHTML = '<p style="text-align: center; padding: 20px;">No Star Rewards Cards have been assigned to you as an Achiever yet.</p>';
            } else {
                snapshot.forEach(doc => {
                    const cardData = doc.data();
                    const cardElement = createCardElement(doc.id, cardData);
                    assignedCardsList.appendChild(cardElement);
                });
            }
        })
        .catch(error => {
            console.error("Error loading assigned cards:", error);
        });
}

// Create a card element
function createCardElement(cardId, cardData) {
    const cardElement = document.createElement('div');
    cardElement.className = 'reward-card-item';
    cardElement.setAttribute('data-id', cardId);
    
    // Calculate progress
    const completedTasks = cardData.tasks ? cardData.tasks.filter(task => task.completed).length : 0;
    const totalTasks = cardData.tasks ? cardData.tasks.length : 0;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    cardElement.innerHTML = `
        <div class="reward-card-header">
            <div class="reward-card-title">${cardData.title}</div>
            <div class="reward-card-status ${cardData.status}">${cardData.status}</div>
        </div>
        <div class="reward-card-info">
            <div class="reward-card-creator">
                ${cardData.createdBy === currentUser.uid ? 'You are the Creator' : 'You are the Achiever'}
            </div>
            <div class="reward-card-progress">
                ${completedTasks}/${totalTasks}
                <div class="mini-progress-bar">
                    <div class="mini-progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add click event to open the card
    cardElement.addEventListener('click', () => {
        openCardDetail(cardId);
    });
    
    return cardElement;
}

// Open card detail view
function openCardDetail(cardId) {
    currentCardId = cardId;
    
    // Fetch card data
    db.collection('rewardCards').doc(cardId).get()
        .then(doc => {
            if (doc.exists) {
                currentCardData = doc.data();
                isCardCreator = currentCardData.createdBy === currentUser.uid;
                
                // Update UI based on card data
                cardTitle.textContent = currentCardData.title;
                
                // Update task counts
                const completedTasks = currentCardData.tasks.filter(task => task.completed).length;
                const totalTasks = currentCardData.tasks.length;
                completedTasksCount.textContent = completedTasks;
                totalTasksCount.textContent = totalTasks;
                
                // Update stars count (1 star per completed task)
                starsEarned.textContent = completedTasks;
                
                // Enable/disable redeem button
                redeemButton.disabled = completedTasks < 10;
                
                // Populate tasks
                populateTasks();
                
                // Show/hide creator-only elements
                addTaskSection.style.display = isCardCreator ? 'block' : 'none';
                toggleShareSectionButton.style.display = isCardCreator ? 'block' : 'none';
                
                // Hide share section initially
                shareCardSection.style.display = 'none';
                
                // If creator, load invitations
                if (isCardCreator) {
                    loadInvitations();
                }
                
                // Switch to card detail view
                dashboardView.style.display = 'none';
                cardDetailView.style.display = 'block';
            } else {
                alert('Card not found.');
            }
        })
        .catch(error => {
            console.error("Error loading card:", error);
            alert('Error loading card details.');
        });
}

// Populate tasks in the card detail view
function populateTasks() {
    tasksContainer.innerHTML = '';
    
    if (!currentCardData.tasks || currentCardData.tasks.length === 0) {
        tasksContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No tasks added yet.</p>';
        return;
    }
    
    currentCardData.tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        // Check if task has completedBy data
        let completedByText = '';
        if (task.completed && task.completedBy) {
            // Get user email
            db.collection('users').doc(task.completedBy).get()
                .then(userDoc => {
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const completedByElement = taskElement.querySelector('.task-completed-by');
                        if (completedByElement) {
                            completedByElement.textContent = `Completed by: ${userData.email}`;
                        }
                    }
                });
            
            completedByText = `<div class="task-completed-by">Completed</div>`;
        }
        
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'completed' : ''}" data-index="${index}">
                ${task.completed ? '✓' : ''}
            </div>
            <div class="task-details">
                <div class="task-text">${task.description}</div>
                ${completedByText}
            </div>
            ${isCardCreator ? `
                <div class="task-controls">
                    <button class="task-control-btn delete" data-index="${index}">✕</button>
                </div>
            ` : ''}
        `;
        
        // Add event listener to checkbox
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => {
            toggleTaskCompletion(index);
        });
        
        // Add event listener to delete button (if creator)
        if (isCardCreator) {
            const deleteButton = taskElement.querySelector('.task-control-btn.delete');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering checkbox click
                deleteTask(index);
            });
        }
        
        tasksContainer.appendChild(taskElement);
    });
}

// Toggle task completion status
function toggleTaskCompletion(taskIndex) {
    // Cannot toggle a completed task if not the person who completed it
    if (currentCardData.tasks[taskIndex].completed && 
        currentCardData.tasks[taskIndex].completedBy && 
        currentCardData.tasks[taskIndex].completedBy !== currentUser.uid) {
        alert("This task was completed by someone else and cannot be modified.");
        return;
    }
    
    // Toggle completion status
    const newCompletionStatus = !currentCardData.tasks[taskIndex].completed;
    
    // Update Firestore with the new status
    const taskRef = db.collection('rewardCards').doc(currentCardId);
    
    // Create updated task object
    const updatedTask = {
        ...currentCardData.tasks[taskIndex],
        completed: newCompletionStatus
    };
    
    // If now completed, add completedBy and completedAt
    if (newCompletionStatus) {
        updatedTask.completedBy = currentUser.uid;
        updatedTask.completedAt = firebase.firestore.FieldValue.serverTimestamp();
    } else {
        // If uncompleted, remove these fields
        delete updatedTask.completedBy;
        delete updatedTask.completedAt;
    }
    
    // Create new tasks array
    const updatedTasks = [...currentCardData.tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    // Update Firestore
    taskRef.update({
        tasks: updatedTasks
    })
    .then(() => {
        // Update local data
        currentCardData.tasks = updatedTasks;
        
        // Update UI
        populateTasks();
        
        // Update task counts and stars
        const completedTasks = currentCardData.tasks.filter(task => task.completed).length;
        completedTasksCount.textContent = completedTasks;
        starsEarned.textContent = completedTasks;
        
        // Enable/disable redeem button
        redeemButton.disabled = completedTasks < 10;
    })
    .catch(error => {
        console.error("Error updating task:", error);
        alert("Error updating task. Please try again.");
    });
}

// Delete a task (creator only)
function deleteTask(taskIndex) {
    if (!isCardCreator) return;
    
    if (confirm("Are you sure you want to delete this task?")) {
        // Create new tasks array without the deleted task
        const updatedTasks = currentCardData.tasks.filter((_, index) => index !== taskIndex);
        
        // Update Firestore
        db.collection('rewardCards').doc(currentCardId).update({
            tasks: updatedTasks
        })
        .then(() => {
            // Update local data
            currentCardData.tasks = updatedTasks;
            
            // Update UI
            populateTasks();
            
            // Update task counts and stars
            const completedTasks = currentCardData.tasks.filter(task => task.completed).length;
            const totalTasks = currentCardData.tasks.length;
            completedTasksCount.textContent = completedTasks;
            totalTasksCount.textContent = totalTasks;
            starsEarned.textContent = completedTasks;
            
            // Enable/disable redeem button
            redeemButton.disabled = completedTasks < 10;
        })
        .catch(error => {
            console.error("Error deleting task:", error);
            alert("Error deleting task. Please try again.");
        });
    }
}

// Add a new task (creator only)
function addNewTask() {
    if (!isCardCreator) return;
    
    const taskDescription = newTaskInput.value.trim();
    if (!taskDescription) {
        alert("Please enter a task description.");
        return;
    }
    
// First get the current timestamp
const timestamp = new Date();

// Create new task object
const newTask = {
    description: taskDescription,
    completed: false,
    createdAt: timestamp
};

// Add task to Firestore
db.collection('rewardCards').doc(currentCardId).update({
    tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
})
    .then(() => {
        // Update local data
        currentCardData.tasks.push(newTask);
        
        // Clear input
        newTaskInput.value = '';
        
        // Update UI
        populateTasks();
        
        // Update task count
        const totalTasks = currentCardData.tasks.length;
        totalTasksCount.textContent = totalTasks;
    })
    .catch(error => {
        console.error("Error adding task:", error);
        alert("Error adding task. Please try again.");
    });
}

// Load invitations for the current card
function loadInvitations() {
    invitationsContainer.innerHTML = '';
    
    db.collection('invitations')
        .where('cardId', '==', currentCardId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                invitationsContainer.innerHTML = '<p style="text-align: center; padding: 10px;">No invitations sent yet.</p>';
            } else {
                snapshot.forEach(doc => {
                    const invitationData = doc.data();
                    const invitationElement = document.createElement('div');
                    invitationElement.className = 'invitation-item';
                    invitationElement.innerHTML = `
                        <div class="invitation-email">${invitationData.recipientEmail}</div>
                        <div class="invitation-status ${invitationData.status}">${invitationData.status}</div>
                    `;
                    invitationsContainer.appendChild(invitationElement);
                });
            }
        })
        .catch(error => {
            console.error("Error loading invitations:", error);
            invitationsContainer.innerHTML = '<p style="text-align: center; color: #c62828; padding: 10px;">Error loading invitations.</p>';
        });
}

// Send invitation to another user
function sendInvitation() {
    const recipientEmail = recipientEmailInput.value.trim();
    if (!recipientEmail) {
        alert("Please enter a recipient email.");
        return;
    }
    
    // Check if this is a valid email
    if (!recipientEmail.includes('@')) {
        alert("Please enter a valid email address.");
        return;
    }
    
    // Create invitation in Firestore
    db.collection('invitations').add({
        cardId: currentCardId,
        creatorId: currentUser.uid,
        creatorEmail: currentUser.email,
        recipientEmail: recipientEmail,
        status: 'pending',
        role: 'achiever', // Specifies the role as "achiever"
        message: `${currentUser.email} has invited you to be an Achiever on their Star Rewards Card: "${currentCardData.title}"`,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        expires: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days
    })
    .then(() => {
        // Clear input
        recipientEmailInput.value = '';
        
        // Reload invitations
        loadInvitations();
        
        alert("Invitation sent successfully!");
    })
    .catch(error => {
        console.error("Error sending invitation:", error);
        alert("Error sending invitation. Please try again.");
    });
}

// Create a new reward card
function createNewCard() {
    const title = cardTitleInput.value.trim();
    if (!title) {
        alert("Please enter a card title.");
        return;
    }
    
    // Create card in Firestore
    db.collection('rewardCards').add({
        title: title,
        createdBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        tasks: [],
        rewards: {
            custom: [
                "Full body massage for 30 minutes",
                "Cook favorite meal for dinner",
                "Watch favorite movie without complaint",
                "Special date night"
            ],
            amazon: []
        }
    })
    .then(() => {
        // Clear input and close modal
        cardTitleInput.value = '';
        createCardModal.style.display = 'none';
        
        // Reload cards
        loadUserCards();
        
        alert("Star Rewards Card created successfully!");
    })
    .catch(error => {
        console.error("Error creating card:", error);
        alert("Error creating card. Please try again.");
    });
}

// Load custom rewards for the current card
function loadCustomRewards() {
    customRewardsList.innerHTML = '';
    
    if (!currentCardData.rewards || !currentCardData.rewards.custom || currentCardData.rewards.custom.length === 0) {
        customRewardsList.innerHTML = '<p style="text-align: center; padding: 10px;">No custom rewards added yet.</p>';
        return;
    }
    
    currentCardData.rewards.custom.forEach((reward, index) => {
        const rewardElement = document.createElement('div');
        rewardElement.className = 'reward-item';
        rewardElement.innerHTML = `
            <div class="reward-details">
                <div class="reward-title">${reward}</div>
            </div>
            <button class="task-control-btn delete" data-index="${index}">✕</button>
        `;
        
        // Add event listener to delete button
        const deleteButton = rewardElement.querySelector('.task-control-btn.delete');
        deleteButton.addEventListener('click', () => {
            deleteCustomReward(index);
        });
        
        customRewardsList.appendChild(rewardElement);
    });
}

// Load Amazon products for the current card
function loadAmazonProducts() {
    amazonProductsList.innerHTML = '';
    
    if (!currentCardData.rewards || !currentCardData.rewards.amazon || currentCardData.rewards.amazon.length === 0) {
        amazonProductsList.innerHTML = '<p style="text-align: center; padding: 10px;">No Amazon products added yet.</p>';
        return;
    }
    
    currentCardData.rewards.amazon.forEach((product, index) => {
        // Add affiliate ID to the URL if it's an Amazon product URL
        let productUrl = product.url;
        if (productUrl && productUrl.includes('amazon.com')) {
            try {
                const url = new URL(productUrl);
                // Add or replace the tag parameter
                url.searchParams.set('tag', affiliateId);
                productUrl = url.toString();
            } catch (e) {
                console.error("Error parsing URL:", e);
            }
        }
        
        const productElement = document.createElement('div');
        productElement.className = 'reward-item';
        productElement.innerHTML = `
            ${product.image ? `<img src="${product.image}" alt="${product.title}">` : ''}
            <div class="reward-details">
                <div class="reward-title">${product.title}</div>
                ${product.price ? `<div class="reward-price">${product.price}</div>` : ''}
            </div>
            <button class="task-control-btn delete" data-index="${index}">✕</button>
        `;
        
        // Add event listener to delete button
        const deleteButton = productElement.querySelector('.task-control-btn.delete');
        deleteButton.addEventListener('click', () => {
            deleteAmazonProduct(index);
        });
        
        amazonProductsList.appendChild(productElement);
    });
}

// Add a new custom reward
function addCustomReward() {
    const rewardText = newRewardInput.value.trim();
    if (!rewardText) {
        alert("Please enter a reward.");
        return;
    }
    
    // Initialize rewards if they don't exist
    if (!currentCardData.rewards) {
        currentCardData.rewards = { custom: [], amazon: [] };
    } else if (!currentCardData.rewards.custom) {
        currentCardData.rewards.custom = [];
    }
    
    // Add reward to Firestore
    const cardRef = db.collection('rewardCards').doc(currentCardId);
    cardRef.update({
        'rewards.custom': firebase.firestore.FieldValue.arrayUnion(rewardText)
    })
    .then(() => {
        // Update local data
        currentCardData.rewards.custom.push(rewardText);
        
        // Clear input
        newRewardInput.value = '';
        
        // Reload rewards
        loadCustomRewards();
    })
    .catch(error => {
        console.error("Error adding reward:", error);
        alert("Error adding reward. Please try again.");
    });
}

// Delete a custom reward
function deleteCustomReward(index) {
    // Get the reward to delete
    const rewardToDelete = currentCardData.rewards.custom[index];
    
    // Remove from Firestore
    const cardRef = db.collection('rewardCards').doc(currentCardId);
    cardRef.update({
        'rewards.custom': firebase.firestore.FieldValue.arrayRemove(rewardToDelete)
    })
    .then(() => {
        // Update local data
        currentCardData.rewards.custom.splice(index, 1);
        
        // Reload rewards
        loadCustomRewards();
    })
    .catch(error => {
        console.error("Error deleting reward:", error);
        alert("Error deleting reward. Please try again.");
    });
}

// Extract Amazon product ID from URL
function extractAmazonProductId(url) {
    try {
        const urlObj = new URL(url);
        
        // Handle amazon.com URLs
        if (urlObj.hostname.includes('amazon')) {
            // Try to extract product ID from path for regular URLs
            const pathMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
            if (pathMatch && pathMatch[1]) {
                return pathMatch[1];
            }
            
            // Try to extract from query parameters
            const asinParam = urlObj.searchParams.get('asin');
            if (asinParam) {
                return asinParam;
            }
        }
        
        // Handle shortened URLs (amzn.eu, amzn.to, etc.)
        if (urlObj.hostname.includes('amzn.')) {
            // For shortened URLs like amzn.eu/d/PRODUCTID
            const pathParts = urlObj.pathname.split('/');
            // Check if we have a pattern like /d/PRODUCTID
            if (pathParts.length >= 3 && pathParts[1] === 'd') {
                return pathParts[2];
            }
        }
        
        return null;
    } catch (e) {
        console.error("Error parsing URL:", e);
        return null;
    }
}

// Fetch Amazon product details and add to rewards
// Fetch Amazon product details and add to rewards
async function addAmazonProduct() {
    const productUrl = amazonProductUrl.value.trim();
    if (!productUrl) {
        alert("Please enter an Amazon product URL.");
        return;
    }
    
    // Show loading indicator
    amazonLoading.style.display = 'block';
    
    try {
        const productId = extractAmazonProductId(productUrl);
        if (!productId) {
            throw new Error("Invalid Amazon product URL. Please ensure it's a valid product page.");
        }
        
        // Use mock data instead of API call for now
        console.log("Using mock data for product ID:", productId);
        
        const mockProductData = {
            title: `Amazon Product ${productId}`,
            price: "$29.99",
            image: `https://via.placeholder.com/150?text=Product+${productId}`,
            url: productUrl
        };
        
        // Initialize rewards if they don't exist
        if (!currentCardData.rewards) {
            currentCardData.rewards = { custom: [], amazon: [] };
        } else if (!currentCardData.rewards.amazon) {
            currentCardData.rewards.amazon = [];
        }
        
        // Add product to Firestore
        const cardRef = db.collection('rewardCards').doc(currentCardId);
        cardRef.update({
            'rewards.amazon': firebase.firestore.FieldValue.arrayUnion(mockProductData)
        })
        .then(() => {
            // Update local data
            currentCardData.rewards.amazon.push(mockProductData);
            
            // Clear input
            amazonProductUrl.value = '';
            
            // Reload products
            loadAmazonProducts();
        })
        .catch(error => {
            console.error("Error adding product:", error);
            alert("Error adding product. Please try again.");
        });
        
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error("Error fetching Amazon product:", error);
    } finally {
        // Hide loading indicator
        amazonLoading.style.display = 'none';
    }
}

// Delete an Amazon product
function deleteAmazonProduct(index) {
    // Get the product to delete
    const productToDelete = currentCardData.rewards.amazon[index];
    
    // Remove from Firestore
    const cardRef = db.collection('rewardCards').doc(currentCardId);
    cardRef.update({
        'rewards.amazon': firebase.firestore.FieldValue.arrayRemove(productToDelete)
    })
    .then(() => {
        // Update local data
        currentCardData.rewards.amazon.splice(index, 1);
        
        // Reload products
        loadAmazonProducts();
    })
    .catch(error => {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
    });
}

// Get random reward from either custom or Amazon list
function getRandomReward() {
    const customRewards = currentCardData.rewards.custom || [];
    const amazonProducts = currentCardData.rewards.amazon || [];
    
    if (customRewards.length === 0 && amazonProducts.length === 0) {
        return {
            type: 'custom',
            content: 'No rewards available. Please add some rewards first.'
        };
    }
    
    const combinedRewards = [...customRewards, ...amazonProducts];
    const randomIndex = Math.floor(Math.random() * combinedRewards.length);
    
    if (randomIndex < customRewards.length) {
        return {
            type: 'custom',
            content: customRewards[randomIndex]
        };
    } else {
        const amazonProduct = amazonProducts[randomIndex - customRewards.length];
        return {
            type: 'amazon',
            content: amazonProduct
        };
    }
}

// Display random reward in the result modal
function displayRandomReward() {
    const reward = getRandomReward();
    
    if (reward.type === 'custom') {
        randomRewardDisplay.innerHTML = `
            <p class="modal-text">${reward.content}</p>
        `;
        // Hide affiliate disclosure for custom rewards
        rewardAffiliateDisclosure.style.display = 'none';
    } else {
        // Format Amazon product with affiliate link
        let productUrl = reward.content.url;
        if (productUrl && productUrl.includes('amazon.com')) {
            try {
                const url = new URL(productUrl);
                url.searchParams.set('tag', affiliateId);
                productUrl = url.toString();
            } catch (e) {
                console.error("Error parsing URL:", e);
            }
        }
        
        randomRewardDisplay.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                ${reward.content.image ? `<img src="${reward.content.image}" alt="${reward.content.title}" style="max-width: 100%; max-height: 150px; border-radius: 8px;">` : ''}
                <h4 style="margin: 10px 0;">${reward.content.title}</h4>
                ${reward.content.price ? `<p>${reward.content.price}</p>` : ''}
                <a href="${productUrl}" target="_blank" class="button" style="display: inline-block; margin-top: 10px;">View on Amazon</a>
            </div>
        `;
        
        // Show affiliate disclosure for Amazon products
        rewardAffiliateDisclosure.style.display = 'block';
    }
}

// Accept reward and reset stars
function acceptReward() {
    // Add to redemption history
    const reward = getRandomReward();
    
    // Update Firestore with redemption
    db.collection('rewardCards').doc(currentCardId).update({
        redemptionHistory: firebase.firestore.FieldValue.arrayUnion({
            date: firebase.firestore.FieldValue.serverTimestamp(),
            reward: reward.type === 'custom' ? reward.content : reward.content.title,
            type: reward.type
        })
    })
    .then(() => {
        // Close reward result modal
        rewardResultModal.style.display = 'none';
        
        alert('Reward accepted! Enjoy your reward.');
    })
    .catch(error => {
        console.error("Error accepting reward:", error);
        alert("Error accepting reward. Please try again.");
    });
}

// Authentication functions
function showAuthModal(mode) {
    authMode = mode;
    
    if (mode === 'signin') {
        authModalTitle.textContent = 'Sign In';
        authSubmitButton.textContent = 'Sign In';
        switchAuthModeLink.textContent = "Don't have an account? Register";
    } else {
        authModalTitle.textContent = 'Register';
        authSubmitButton.textContent = 'Register';
        switchAuthModeLink.textContent = "Already have an account? Sign In";
    }
    
    authModal.style.display = 'flex';
}

function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (authMode === 'signin') {
        // Sign in
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                authModal.style.display = 'none';
                authForm.reset();
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
            });
    } else {
        // Register
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Create user document in Firestore
                db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                authModal.style.display = 'none';
                authForm.reset();
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
            });
    }
}

function handlePasswordReset(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert('Password reset email sent! Check your inbox.');
            resetPasswordModal.style.display = 'none';
            resetPasswordForm.reset();
            authModal.style.display = 'flex';
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
}

// Initialize event listeners after DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Authentication event listeners
    authForm.addEventListener('submit', handleAuth);
    
    switchAuthModeLink.addEventListener('click', () => {
        authMode = authMode === 'signin' ? 'register' : 'signin';
        
        if (authMode === 'signin') {
            authModalTitle.textContent = 'Sign In';
            authSubmitButton.textContent = 'Sign In';
            switchAuthModeLink.textContent = "Don't have an account? Register";
        } else {
            authModalTitle.textContent = 'Register';
            authSubmitButton.textContent = 'Register';
            switchAuthModeLink.textContent = "Already have an account? Sign In";
        }
    });
    
    forgotPasswordLink.addEventListener('click', () => {
        authModal.style.display = 'none';
        resetPasswordModal.style.display = 'flex';
    });
    
    resetPasswordForm.addEventListener('submit', handlePasswordReset);
    
    backToLoginLink.addEventListener('click', () => {
        resetPasswordModal.style.display = 'none';
        authModal.style.display = 'flex';
    });
    
    logoutButton.addEventListener('click', () => {
        auth.signOut();
    });
    
    // Dashboard event listeners
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            // Update active tab
            tabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide tab content
            if (tabType === 'created') {
                createdCardsTab.style.display = 'block';
                assignedCardsTab.style.display = 'none';
            } else {
                createdCardsTab.style.display = 'none';
                assignedCardsTab.style.display = 'block';
            }
        });
    });
    
    createCardButton.addEventListener('click', () => {
        createCardModal.style.display = 'flex';
    });
    
    createCardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createNewCard();
    });
    
    cancelCreateCardButton.addEventListener('click', () => {
        createCardModal.style.display = 'none';
        cardTitleInput.value = '';
    });
    
    // Card Detail event listeners
    addTaskButton.addEventListener('click', addNewTask);
    
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });
    
    backToDashboardButton.addEventListener('click', () => {
        // Return to dashboard view
        cardDetailView.style.display = 'none';
        dashboardView.style.display = 'block';
        
        // Reset current card data
        currentCardId = null;
        currentCardData = null;
        isCardCreator = false;
    });
    
    toggleShareSectionButton.addEventListener('click', () => {
        // Toggle share section visibility
        if (shareCardSection.style.display === 'none') {
            shareCardSection.style.display = 'block';
            toggleShareSectionButton.textContent = 'Hide Sharing';
        } else {
            shareCardSection.style.display = 'none';
            toggleShareSectionButton.textContent = 'Share Card';
        }
    });
    
    sendInvitationButton.addEventListener('click', sendInvitation);
    
    // Rewards event listeners
    redeemButton.addEventListener('click', () => {
        redemptionModal.style.display = 'flex';
    });
    
    redeemNowButton.addEventListener('click', () => {
        redemptionModal.style.display = 'none';
        displayRandomReward();
        rewardResultModal.style.display = 'flex';
    });
    
    saveForLaterButton.addEventListener('click', () => {
        redemptionModal.style.display = 'none';
    });
    
    acceptRewardButton.addEventListener('click', acceptReward);
    
    tryAnotherRewardButton.addEventListener('click', displayRandomReward);
    
    manageRewardsButton.addEventListener('click', () => {
        // Load rewards data
        loadCustomRewards();
        loadAmazonProducts();
        
        // Show rewards manager modal
        rewardsManagerModal.style.display = 'flex';
    });
    
    // Rewards manager tab event listeners
    rewardsTabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            // Update active tab
            rewardsTabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide tab content
            if (tabType === 'custom-rewards') {
                customRewardsSection.style.display = 'block';
                amazonRewardsSection.style.display = 'none';
            } else {
                customRewardsSection.style.display = 'none';
                amazonRewardsSection.style.display = 'block';
            }
        });
    });
    
    addNewRewardButton.addEventListener('click', addCustomReward);
    
    newRewardInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCustomReward();
        }
    });
    
    addAmazonProductButton.addEventListener('click', addAmazonProduct);
    
    amazonProductUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addAmazonProduct();
        }
    });
    
    closeRewardsManagerButton.addEventListener('click', () => {
        rewardsManagerModal.style.display = 'none';
    });
});
