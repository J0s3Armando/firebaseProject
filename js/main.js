var taskList = document.getElementById('tasklist');
var formTask = document.querySelector('#add-assignment-form');
//components used to update
var updateId       = null;
var updateBtn      = document.getElementById('updateTask');
var newTitle       = '';
var newDescription = '';

document.addEventListener('DOMContentLoaded',()=>
{
    var elems = document.querySelectorAll('.modal');
    var inst  = M.Modal.init(elems);
});


db.collection('homeworks').orderBy('title').onSnapshot(snapshot=>{
    let changes = snapshot.docChanges(); 
    //get all items form database and all changes
    changes.forEach((change) =>{
        if(change.type == 'added')
        {
            homeworkList( change.doc );
        }
        else if(change.type == 'removed')
        {   
            let li = document.querySelector(`[data-id="${change.doc.id}"]`);
            li.remove();
        }
        else if(change.type=='modified')
        {
            let                     li                     = document.querySelector(`[data-id="${change.doc.id}"]`);
            li.getElementsByTagName('span')[0].textContent = newTitle;
            li.getElementsByTagName('p')[0].textContent    = newDescription;
                                    newTitle               = '';
                                    newDescription         = '';
        }
    });
});

formTask.addEventListener('submit',(e)=>{
    e.preventDefault();
    const title       = formTask.title.value;
    const description = formTask.description.value;
    //validate empty fields
    if(title && description)
    {
        db.collection('homeworks').add({
            title,
            description
        });
        formTask.reset();
    }
});

function homeworkList(data) {
   let li           = document.createElement('li');
       li.className = 'collection-item';
   li.setAttribute('data-id',data.id);

   let div               = document.createElement('div');
   let title             = document.createElement('span');
       title.className   = 'bold-text';
       title.textContent = data.data().title;
   
   let enlace           = document.createElement('a');
       enlace.href      = '#modal1';
       enlace.className = 'secondary-content modal-trigger';
    
    let editBtn           = document.createElement('i');
        editBtn.className = 'material-icons';
        editBtn.innerHTML = 'edit';

    let delBtn              = document.createElement('i');
        delBtn.className    = 'secondary-content material-icons';
        delBtn.style.cursor = 'pointer';
        delBtn.innerHTML    = 'delete';

   let description             = document.createElement('p');
       description.className   = 'text-justified';
       description.textContent = data.data().description;

    enlace.appendChild(editBtn);
    div.appendChild(title);
    div.appendChild(delBtn);
    div.appendChild(enlace);
    li.appendChild(div);
    li.appendChild(description);

    delBtn.addEventListener('click',e =>{
        //delete a task
        let deleteTaskID = e.target.parentElement.parentElement.getAttribute('data-id');
        let taskTitle = e.target.previousElementSibling.textContent;
        Swal.fire({
            title:`"${taskTitle}"`,
            text:"¿Estás seguro de eliminar el recordatorio?",
            showCancelButton: true,
            cancelButtonColor: '#d32f2f',
            cancelButtonText:'Cancelar',
            confirmButtonColor: '#1565c0',
            confirmButtonText : 'Sí, eliminar',
        }).then((result)=>{
            if(result.isConfirmed)
            {
                db.collection('homeworks').doc(deleteTaskID).delete(); //delete from database
                Swal.fire(
                    {
                        title: 'Eliminado',
                        text: 'El recordatorio ha sido eliminado',
                        confirmButtonText:'Aceptar'
                    }
                );
            }
        });
    });

    editBtn.addEventListener('click',(e)=>{
                    updateId    = e.target.parentElement.parentElement.parentElement.getAttribute('data-id');
              const elements    = e.target.parentElement.parentElement;
              const title       = elements.firstElementChild.textContent;
              const description = elements.nextElementSibling.textContent;
        
        document.getElementsByName('newTitle')[0].value       = title;
        document.getElementsByName('newDescription')[0].value = description;
    });

    taskList.appendChild(li);
}

//update information button
updateBtn.addEventListener('click',()=>{
    newTitle = document.getElementsByName('newTitle')[0].value;
    newDescription = document.getElementsByName('newDescription')[0].value;
    if(newTitle && newDescription)
    {
        db.collection('homeworks').doc(updateId).update({
            title       : newTitle,
            description : newDescription
        });
    }
    document.getElementsByName('newTitle')[0].value = '';
    document.getElementsByName('newDescription')[0].value = '';
});